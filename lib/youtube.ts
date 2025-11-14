import axios from "axios";
import { Platform } from "react-native";

const IS_ANDROID = Platform.OS === "android";
const HOST = IS_ANDROID ? "10.0.2.2" : "localhost";
const PROXY = `http://${HOST}:3000/youtube-search`;

export function buildYouTubeQuery(title: string, artist: string) {
  const t = normalize(title);
  const a = normalize(artist);
  // Bazı parçalarda artist + title daha iyi; iki varyantı da deneyeceğiz
  return `${a} ${t} audio`;
}

export async function searchYouTubeVideoId(q: string) {
  const v1 = q;
  const v2 = swapArtistTitle(q);          // başlığı sonda ise öne al
  const v3 = `${q} official audio`;
  const v4 = `${q} lyrics`;
  const candidates = [v1, v2, v3, v4, stripHints(q)];

  for (const cand of candidates) {
    const url = `${PROXY}?q=${encodeURIComponent(cand)}`;
    try {
      console.log("[YT proxy] GET", url);
      const r = await axios.get(url, { timeout: 6000 });
      console.log("[YT proxy] status", r.status);
      const j = r.data;
      if (j?.id) {
        console.log("[YT proxy] HIT", j.id, "-", j.title);
        return { id: String(j.id), title: String(j.title ?? cand) };
      }
    } catch (e: any) {
      console.warn("[YT proxy] error:", e?.message || e);
    }
  }
  console.warn("[YT proxy] no result for:", q);
  return null;
}

function stripHints(s: string) {
  return s.replace(/\b(audio|official|lyrics)\b/gi, "").replace(/\s+/g, " ").trim();
}
function normalize(s: string) {
  return (s || "")
    .replace(/\(.*?\)/g, " ")
    .replace(/\bfeat\.?\b.*$/i, " ")
    .replace(/[&/]/g, " ")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").trim();
}
function swapArtistTitle(q: string) {
  // "ARTIST TITLE audio" -> "TITLE ARTIST audio" gibi basit bir deneme
  const parts = q.split(" audio")[0].split(" ");
  if (parts.length < 2) return q;
  const last = parts.pop();
  const rest = parts.join(" ");
  return `${last} ${rest} audio`;
}
