"use client";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

export default function useLenis() {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    lenisRef.current = new Lenis({
      duration: 1.5,
      smooth: true,
      lerp: 0.1,
      smoothWheel: true,
    });

    const raf = (time) => {
      lenisRef.current?.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenisRef.current?.destroy();
    };
  }, []);
}
