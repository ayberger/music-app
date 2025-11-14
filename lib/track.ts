// lib/track.ts
export type Track = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url?: string;       // Spotify preview veya local ses
  isLocal?: boolean;  // local dummy mi?
};

// 🟣 Local / dummy parça dönüştürücü
export function toLocalTrack(d: any): Track {
  return {
    id: String(d.id ?? Math.random().toString(36).slice(2)),
    title: d.title ?? d.name ?? "Unknown Title",
    artist: d.artist ?? d.artists?.join(", ") ?? "Unknown Artist",
    artwork: d.image ?? d.artwork ?? "",
    url: d.url,          // local mp3 dosyası
    isLocal: true,
  };
}

// 🟢 Spotify parça dönüştürücü
export function toSpotifyTrack(sp: any): Track {
  const cover =
  sp?.album?.images?.[0]?.url ??
  sp?.images?.[0]?.url ??
  undefined;

  const firstArtist =
    sp?.artists?.[0]?.name ??
    sp?.artist?.name ??
    (Array.isArray(sp?.artists) ? sp.artists.join(", ") : "Unknown Artist");

  return {
    id: String(sp?.id ?? sp?.uri ?? Math.random().toString(36).slice(2)),
    title: sp?.name ?? "Unknown Title",
    artist: firstArtist,
    artwork: cover,
    url: sp?.preview_url || undefined,  // yoksa undefined (YouTube fallback)
    isLocal: false,
  };
}

// (opsiyonel) Eski importlar için alias
export const toTrack = toLocalTrack;
