// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

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
    const url = `${host}/api/v1/search?q=${encodeURIComponent(q)}&region=TR&hl=tr`;
    try {
      const r = await axios.get(url, {
        headers: { Accept: "application/json,text/plain,*/*" },
        timeout: 5000,
      });
      const data = r.data;
      if (typeof data !== "object") continue;
      const items = Array.isArray(data.items) ? data.items : [];
      const vid = items.find((x) => x?.type === "video" && typeof x?.id === "string");
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

app.listen(3000, () => console.log("Proxy running on port 3000"));
