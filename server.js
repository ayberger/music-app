// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------------------------------------------
 *  YOUTUBE PROXY (senin mevcut kodun)
 * --------------------------------------------------*/

// Buraya senin API KEY'İNİ yaz
const YT_API_KEY = "AIzaSyAIWJfFnBmnDQA4nj9W7Tn7XMLy88pHAp4"; // <-- kendi key’in

const HOSTS = [
  "https://piped.video",
  "https://piped.projectsegfau.lt",
  "https://piped.in.projectsegfau.lt",
  "https://piped.privacy.com.de",
];

app.get("/youtube-search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "missing q" });

  // 1️⃣ YouTube Data API (öncelikli)
  try {
    const r = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        type: "video",
        maxResults: 1,
        regionCode: "TR",
        q,
        key: YT_API_KEY,
      },
      timeout: 5000,
    });

    const item = r.data?.items?.[0];
    const id = item?.id?.videoId || null;
    const title = item?.snippet?.title || null;

    if (id) {
      console.log(`[YT API] HIT: ${title} (${id})`);
      return res.json({ id, title });
    }
  } catch (e) {
    console.warn("YT API failed:", e?.response?.status || e?.message);
  }

  // 2️⃣ Fallback: Piped
  for (const host of HOSTS) {
    const url = `${host}/api/v1/search?q=${encodeURIComponent(
      q
    )}&region=TR&hl=tr`;
    try {
      const r = await axios.get(url, {
        headers: { Accept: "application/json,text/plain,*/*" },
        timeout: 5000,
      });
      const data = r.data;
      if (typeof data !== "object") continue;
      const items = Array.isArray(data.items) ? data.items : [];
      const vid = items.find(
        (x) => x?.type === "video" && typeof x?.id === "string"
      );
      if (vid) {
        console.log(`[PIPED] HIT: ${vid.title} (${vid.id})`);
        return res.json({ id: vid.id, title: vid.title });
      }
    } catch {
      continue;
    }
  }

  // 3️⃣ Hiçbiri bulunamadı
  return res.status(200).json({ id: null, title: null });
});

/* ---------------------------------------------------
 *  SPOTIFY OAUTH + AUTO REFRESH
 * --------------------------------------------------*/

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI =
  process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:3000/spotify/callback";

let spotifyAccessToken = null;
let spotifyAccessTokenExpiresAt = 0; // ms cinsinden timestamp
let spotifyRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN || null;

function setSpotifyTokens(data) {
  spotifyAccessToken = data.access_token;
  const expiresInSec = data.expires_in || 3600;
  spotifyAccessTokenExpiresAt = Date.now() + expiresInSec * 1000 - 60 * 1000; // 1 dk erken bitir
  if (data.refresh_token) {
    spotifyRefreshToken = data.refresh_token;
    console.log("♻️ Yeni refresh_token alındı:", spotifyRefreshToken);
  }
}

// 1) Kullanıcıyı Spotify login/izin ekranına yönlendiren endpoint
app.get("/spotify/login", (req, res) => {
  const scope = "user-top-read"; // şimdilik top tracks için yeterli
  const params = querystring.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope,
  });
  const url = `https://accounts.spotify.com/authorize?${params}`;
  res.redirect(url);
});

// 2) Spotify'dan geri dönüş alan callback
app.get("/spotify/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    setSpotifyTokens(tokenRes.data);

    console.log("🔥 Spotify access_token:", spotifyAccessToken);
    console.log("♻️ Spotify refresh_token:", spotifyRefreshToken);

    res.send(
      "Spotify bağlantısı başarılı! Refresh token logda görünüyor, istersen .env içindeki SPOTIFY_REFRESH_TOKEN alanına kaydedip server'ı yeniden başlatabilirsin."
    );
  } catch (e) {
    console.error(
      "Spotify callback error:",
      e.response?.data || e.message || e
    );
    res.status(500).send("Spotify callback error");
  }
});

// 3) Access token süresi dolmuşsa refresh eden fonksiyon
async function getSpotifyAccessToken() {
  // Hâlâ geçerli bir token varsa direkt kullan
  if (spotifyAccessToken && Date.now() < spotifyAccessTokenExpiresAt) {
    return spotifyAccessToken;
  }

  // Elimizde refresh token varsa yenileyelim
  if (!spotifyRefreshToken) {
    throw new Error("No Spotify refresh token set");
  }

  try {
    const res = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: spotifyRefreshToken,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    setSpotifyTokens(res.data);
    console.log("✅ Spotify access_token yenilendi");
    return spotifyAccessToken;
  } catch (e) {
    console.error(
      "Spotify refresh error:",
      e.response?.data || e.message || e
    );
    throw e;
  }
}

// 4) React Native tarafının çağıracağı endpoint
app.get("/spotify/token", async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    res.json({ access_token: token });
  } catch (e) {
    res.status(500).json({ error: "spotify_token_error" });
  }
});

/* ---------------------------------------------------
 *  SERVER START
 * --------------------------------------------------*/

app.listen(3000, () => console.log("Proxy + Spotify server running on port 3000"));
