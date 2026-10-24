'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './home-background.module.css';

export function HomeBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    const sync = () => {
      if (paused || preference.matches || document.hidden || !visible) {
        video.pause();
        return;
      }
      // Attach the source only when motion is allowed; the poster is always usable.
      if (!video.getAttribute('src')) video.src = '/motion/tidal-arc.mp4';
      void video.play().catch(() => {
        // Autoplay may be unavailable; keep the poster as the fallback.
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      video.pause();
    };
  }, [paused]);

  return (
    <>
      <div className={styles.media} aria-hidden="true">
        <Image
          src="/motion/tidal-arc-poster.jpg"
          alt=""
          fill
          preload
          unoptimized
          sizes="100vw"
          className={styles.poster}
        />
        <video
          ref={videoRef}
          className={styles.video}
          poster="/motion/tidal-arc-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          disablePictureInPicture
        />
      </div>
      <button
        type="button"
        className={styles.control}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? 'Play background motion' : 'Pause background motion'}
      </button>
    </>
  );
}
