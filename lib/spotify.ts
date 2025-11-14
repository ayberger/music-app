// lib/spotify.ts
import { toSpotifyTrack, type Track } from "./track";

const API_URL = "https://api.spotify.com/v1";

async function getHeaders() {
  const token = 'BQATI9q0pwvskJXVYbxn4s1u2MjiP05EQsjEm02Zpd53hmy7TL9YpnEHFoQ1-Pzxt2PUbC-y7MdsWNb4rABcHr09B22N9WfXbDkeh6dWSnvRVVnGvsFBy5aQkF4cnnTI2qHs05Mws5YdMjltUFll7aAraICYzINHsWRWD3P2gaWysvehozMZ17Uxexk71h3hEP8Gicl8UPiNofMDNAkRy0k10tXN3IuMVKbOYQucBGvreEBf_9h0nT6MnX2j7Rta6ACdqw7YOoS1xjwitxht9DOfDD5S3eJNnlfy5cYIkwlsqgef'; // Developer portal'dan aldığın token
  if (!token) throw new Error("Spotify token bulunamadı");
  return { Authorization: `Bearer ${token}` };
}

// 🟢 En çok dinlenen şarkılar
export async function fetchTopTracks(
  limit = 20,
  term: "short_term" | "medium_term" | "long_term" = "short_term"
): Promise<Track[]> {
  const res = await fetch(`${API_URL}/me/top/tracks?limit=${limit}&time_range=${term}`, {
    headers: await getHeaders(),
  });
  const json = await res.json();
  return (json.items ?? []).map(toSpotifyTrack);
}

// 🔵 Arama fonksiyonu
export async function searchTracks(query: string, limit = 20): Promise<Track[]> {
  const res = await fetch(
    `${API_URL}/search?type=track&limit=${limit}&q=${encodeURIComponent(query)}`,
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
  const res = await fetch(`${API_URL}/playlists/${playlistId}/tracks?limit=${limit}`, {
    headers: await getHeaders(),
  });
  const json = await res.json();
  return (json.items ?? [])
    .map((row: any) => toSpotifyTrack(row.track))
    .filter((t: Track) => !!t.id);
}

// (isteğe bağlı) profil top artists gibi fonksiyonlar da aynı şekilde
