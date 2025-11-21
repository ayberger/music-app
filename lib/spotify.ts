// lib/spotify.ts
import { toSpotifyTrack, type Track } from "./track";

const API_URL = "https://api.spotify.com/v1";
const BACKEND_URL = "http://10.0.2.2:3000"; // Android emülatörden host makineye erişim

async function getHeaders() {
  // Artık token'ı kendi backend'inden alıyoruz
  const res = await fetch(`${BACKEND_URL}/spotify/token`);
  const json = await res.json();

  if (!json.access_token) {
    console.warn("[Spotify] backend access_token vermedi:", json);
    throw new Error("Spotify token bulunamadı");
  }

  return { Authorization: `Bearer ${json.access_token}` };
}

// 🟢 En çok dinlenen şarkılar (kullanıcının hesabına göre)
export async function fetchTopTracks(
  limit = 20,
  term: "short_term" | "medium_term" | "long_term" = "short_term"
): Promise<Track[]> {
  const res = await fetch(
    `${API_URL}/me/top/tracks?limit=${limit}&time_range=${term}`,
    {
      headers: await getHeaders(),
    }
  );
  const json = await res.json();
  return (json.items ?? []).map(toSpotifyTrack);
}

// 🔵 Arama fonksiyonu
export async function searchTracks(
  query: string,
  limit = 20
): Promise<Track[]> {
  const res = await fetch(
    `${API_URL}/search?type=track&limit=${limit}&q=${encodeURIComponent(
      query
    )}`,
    { headers: await getHeaders() }
  );
  const json = await res.json();
  return (json.tracks?.items ?? []).map(toSpotifyTrack);
}

// 🟣 Playlist parçaları
export async function getPlaylistTracks(
  playlistId: string,
  limit = 50
): Promise<Track[]> {
  const res = await fetch(
    `${API_URL}/playlists/${playlistId}/tracks?limit=${limit}`,
    {
      headers: await getHeaders(),
    }
  );
  const json = await res.json();
  return (json.items ?? [])
    .map((row: any) => toSpotifyTrack(row.track))
    .filter((t: Track) => !!t.id);
}
