import React, { createContext, useContext, useState } from "react";
import type { Track } from "../lib/track";

export type Controls = {
  play: () => void;
  pause: () => void;
  toggle: () => void;
} | null;

type PlayerContextType = {
  currentTrack: Track | null;
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  controls: Controls;
  setControls: React.Dispatch<React.SetStateAction<Controls>>;
  position: number;
  setPosition: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;

  queue: Track[];
  setQueue: React.Dispatch<React.SetStateAction<Track[]>>;

};

const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  setCurrentTrack: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  controls: null,
  setControls: () => {},
  position: 0,
  setPosition: () => {},
  duration: 0,
  setDuration: () => {},

  queue: [],
  setQueue: () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [controls, setControls] = useState<Controls>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);

    return (
        <PlayerContext.Provider
        value={{
            currentTrack, setCurrentTrack,
            isPlaying, setIsPlaying,
            controls, setControls,
            position, setPosition,
            duration, setDuration,
            queue, setQueue,
        }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);
