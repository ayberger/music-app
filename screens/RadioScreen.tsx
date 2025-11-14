// screens/RadioScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import Ionicons from "react-native-vector-icons/Ionicons";
import YoutubePlayer from "react-native-youtube-iframe";

import { colors } from "../theme/colors";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { TabParamList } from "../navigation/TabNavigator";
import { drops } from "../data/drops";
import { toLocalTrack, type Track } from "../lib/track";
import { usePlayer } from "../context/PlayerContext";
import { buildYouTubeQuery, searchYouTubeVideoId } from "../lib/youtube";

type Props = BottomTabScreenProps<TabParamList, "Radio">;

export default function RadioScreen({ route }: Props) {
  // 1) Başlangıç kuyruğu + route değişince senkronize et
  const [queue, setQueue] = useState<Track[]>(() =>
    drops.map((d) => toLocalTrack(d))
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const param = (route.params ?? {}) as any;

    const paramQueue = Array.isArray(param.queue)
      ? (param.queue as Track[])
      : undefined;

    const selectedId: string | undefined =
      param.selectedId != null ? String(param.selectedId) : undefined;

    const nextQueue =
      paramQueue && paramQueue.length > 0
        ? paramQueue
        : drops.map((d) => toLocalTrack(d));

    setQueue(nextQueue);

    const nextIndex = selectedId
      ? Math.max(
          0,
          nextQueue.findIndex((t) => String(t.id) === String(selectedId))
        )
      : 0;

    setCurrentIndex(nextIndex);
  }, [route.params]);



  const currentTrack = useMemo(() => {
    const safe = Math.min(Math.max(currentIndex, 0), queue.length - 1);
    return queue[safe];
  }, [queue, currentIndex]);

  // 2) Global player context
  const {
    setCurrentTrack,
    isPlaying,          // 🔴 tek gerçek playing state
    setIsPlaying,
    setControls,
    setPosition: setCtxPos,
    setDuration: setCtxDur,
  } = usePlayer();

  // 3) YouTube state
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [yt, setYt] = useState<{ id: string; title: string } | null>(null);
  const ytRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 4) Context’e şarkıyı yaz
  useEffect(() => {
    setCurrentTrack(currentTrack);
  }, [currentTrack, setCurrentTrack]);

  // 5) Bu şarkıya uygun YouTube videosunu bul
  useEffect(() => {
    let cancelled = false;
    setYt(null);
    setPosition(0);
    setDuration(0);

    (async () => {
      if (currentTrack?.title && currentTrack?.artist) {
        const q = buildYouTubeQuery(currentTrack.title, currentTrack.artist);
        const v = await searchYouTubeVideoId(q);
        if (!cancelled) setYt(v ?? null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist]);

  // 6) Pozisyon / süre polling (YouTube’tan oku)
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!yt?.id) return;

    timerRef.current = setInterval(async () => {
      try {
        const sec = await ytRef.current?.getCurrentTime?.();
        if (typeof sec === "number") {
          setPosition(sec);
          setCtxPos(sec);
        }
        const dur = await ytRef.current?.getDuration?.();
        if (typeof dur === "number" && dur > 0) {
          setDuration(dur);
          setCtxDur(dur);
        }
      } catch {
        // sessiz geç
      }
    }, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [yt?.id, setCtxPos, setCtxDur]);

  // 7) Kontroller – sadece context kullan
  const play = useCallback(() => {
    ytRef.current?.playVideo?.();
    setIsPlaying(true);
  }, [setIsPlaying]);

  const pause = useCallback(() => {
    ytRef.current?.pauseVideo?.();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  // 7.1) isPlaying değişince YouTube player'ı yönet
  useEffect(() => {
    if (!yt?.id) return;          // video gelmeden dokunma

    if (isPlaying) {
      ytRef.current?.playVideo?.();
    } else {
      ytRef.current?.pauseVideo?.();
    }
  }, [isPlaying, yt?.id]);


  // Mini player da aynı kontrolleri kullansın
  useEffect(() => {
    setControls({
      play,
      pause,
      toggle,
    });
    return () => setControls(null);
  }, [play, pause, toggle, setControls]);

  const seek = (sec: number) => {
    const v = Math.min(Math.max(sec, 0), duration || 0);
    ytRef.current?.seekTo?.(v, true);
    setPosition(v);
    setCtxPos(v);
  };

  const forward10 = () => seek(position + 10);
  const refreshTrack = () => {
    seek(0);
    play();
  };

  const next = () => setCurrentIndex((i) => (i + 1) % queue.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + queue.length) % queue.length);

  return (
    <View style={styles.container}>
      <View style={{ height: 24 }} />

      <View style={styles.circleWrap}>
        <Image source={{ uri: currentTrack.artwork }} style={styles.art} />
      </View>

      <Text style={styles.title}>{currentTrack.title}</Text>
      <Text style={styles.artist}>{currentTrack.artist}</Text>

      <Slider
        style={{ width: "88%", marginTop: 20 }}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        minimumTrackTintColor={colors.lilac}
        maximumTrackTintColor="#4b5563"
        thumbTintColor="#fff"
        onSlidingComplete={seek}
      />

      <View style={styles.timeRow}>
        <Text style={styles.time}>{fmt(position)}</Text>
        <Text style={styles.time}>{fmt(duration)}</Text>
      </View>

      {/* Ana kontroller */}
      <View style={styles.controls}>
        <IconBtn name="play-back" onPress={prev} />
        <IconBtn
          big
          name={isPlaying ? "pause-circle" : "play-circle"}
          onPress={toggle}
        />
        <IconBtn name="play-forward" onPress={next} />
      </View>

      {/* Küçük kontroller */}
      <View style={styles.subControls}>
        <SmallBtn label="+10s" icon="play-forward-outline" onPress={forward10} />
        <SmallBtn label="Refresh" icon="refresh" onPress={refreshTrack} />
      </View>

      {/* YouTube player */}
      {yt?.id && (
        <View style={{ width: "100%", height: 230, marginTop: 24 }}>
          <YoutubePlayer
            ref={ytRef}
            height={230}
            play={isPlaying}
            videoId={yt.id}
            onChangeState={(s: string) => {
              const S = s?.toUpperCase?.() ?? s;
              if (S === "PLAYING") setIsPlaying(true);
              if (S === "PAUSED" || S === "ENDED") setIsPlaying(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

function IconBtn({
  name,
  onPress,
  big = false,
}: {
  name: any;
  onPress: () => void;
  big?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={{ padding: big ? 6 : 2 }}>
      <Ionicons name={name} size={big ? 64 : 32} color="#fff" />
    </Pressable>
  );
}

function SmallBtn({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.smallBtn}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={styles.smallLabel}>{label}</Text>
    </Pressable>
  );
}

const fmt = (sec?: number) => {
  const s = Math.floor(sec ?? 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2a145a", alignItems: "center" },
  circleWrap: {
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f1142",
    marginTop: 40,
  },
  art: { width: "100%", height: "100%" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 16 },
  artist: { color: "#d1d5db", marginTop: 4 },
  timeRow: {
    width: "88%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  time: { color: "#9ca3af", fontSize: 12 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "70%",
    marginTop: 16,
  },
  subControls: {
    marginTop: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  smallLabel: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
