"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const channels = ["bvf1FVVLA60", "UyoV9KRpFcY", "fycfEUSQu_A", "V2KLGns6hn4", "gHHYebHr-C4"];
interface YouTubePlayer {
  cueVideoById(id: string): void;
  loadVideoById(id: string): void;
  destroy(): void;
}
interface YouTubeAPI {
  Player: new (element: HTMLIFrameElement, options: { events: { onReady(): void; onStateChange(event: { data: number }): void; onError(): void } }) => YouTubePlayer;
}
type YouTubeWindow = Window & { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void };

function Speaker({ side }: { side: string }) {
  return <div className={`theater-speaker theater-speaker-${side}`}><Image src="/images/theater/aura-4-front-v2.webp" alt={`Wharfedale AURA 4 ${side === "left" ? "ซ้าย" : "ขวา"}`} width={140} height={540} /><div className="theater-waves" aria-hidden="true">{[0, 1, 2].map(ring => <i key={ring} style={{ animationDelay: `${ring * .65}s` }} />)}</div></div>;
}

export default function HomeTheater() {
  const [channel, setChannel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const screen = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  useEffect(() => {
    const ytWindow = window as YouTubeWindow;
    let disposed = false;
    const previousReady = ytWindow.onYouTubeIframeAPIReady;
    function initialize() {
      if (disposed || player.current || !screen.current || !ytWindow.YT?.Player) return;
      const iframe = document.createElement("iframe");
      iframe.id = "theater-youtube";
      iframe.src = `https://www.youtube-nocookie.com/embed/${channels[0]}?enablejsapi=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`;
      iframe.title = "HiFi Tower TV — YouTube";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      screen.current.appendChild(iframe);
      player.current = new ytWindow.YT.Player(iframe, { events: {
        onReady: () => { if (!disposed) setReady(true); },
        onStateChange: event => { if (!disposed) setPlaying(event.data === 1); },
        onError: () => { if (!disposed) setPlaying(false); },
      } });
    }
    function apiReady() { previousReady?.(); initialize(); }
    if (ytWindow.YT?.Player) initialize();
    else {
      ytWindow.onYouTubeIframeAPIReady = apiReady;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }
    return () => {
      disposed = true;
      if (ytWindow.onYouTubeIframeAPIReady === apiReady) ytWindow.onYouTubeIframeAPIReady = previousReady;
      player.current?.destroy();
      player.current = null;
    };
  }, []);
  function selectChannel(index: number) {
    if (index === channel || !player.current || !ready) return;
    if (playing) player.current.loadVideoById(channels[index]);
    else player.current.cueVideoById(channels[index]);
    setPlaying(false);
    setChannel(index);
  }
  return <div className={`home-theater${playing ? " is-playing" : ""}`} aria-label="TV และชุด Home Theater">
    <div className="theater-scene">
      <Speaker side="left" />
      <div className="theater-tv"><div className="tv-screen" ref={screen} /></div>
      <Speaker side="right" />
      <div className="theater-console" aria-hidden="true"><div className="center-speaker"><Image src="/images/theater/aura-c-front-v2.webp" alt="" width={320} height={150} /></div><div className="theater-receiver"><i /><span>HOME CINEMA</span><i /></div><div className="console-shelf" /></div>
      <div className="theater-subwoofer" aria-hidden="true"><div className="theater-driver" /></div>
    </div>
    <div className="tv-channel-controls" role="group" aria-label="เลือกช่อง YouTube"><span className="channel-caption">TV CHANNEL</span>{channels.map((id, index) => <button key={id} onClick={() => selectChannel(index)} disabled={!ready} aria-pressed={channel === index} aria-label={`ช่อง ${index + 1}`}><small>CH</small>{String(index + 1).padStart(2, "0")}</button>)}</div>
    <p className="theater-brand">WHARFEDALE <span>AURA SERIES</span></p>
    <p className="tv-status" aria-live="polite">ช่อง {channel + 1} / 5{playing ? " · กำลังเล่น" : " · กด Play ที่จอ TV เพื่อรับชม"}</p>
  </div>;
}
