import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { EffectLoader } from "../lib/effect-loader";

const EffectDetail = () => {
  const { id } = useParams();
  const containerRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<EffectLoader | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !id) return;

    const loader = new EffectLoader(containerRef.current);
    loaderRef.current = loader;
    loader.loadEffect(id);

    return () => {
      if (loaderRef.current) {
        loaderRef.current.dispose();
        loaderRef.current = null;
      }
    };
  }, [id]);

  const handlePlayPause = () => {
    if (loaderRef.current) {
      if (isPlaying) {
        loaderRef.current.pause();
      } else {
        loaderRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (loaderRef.current) {
      loaderRef.current.reset();
      setIsPlaying(true);
    }
  };

  const handleToggleSize = () => {
    setIsFullWidth(!isFullWidth);
    // 等待DOM更新完成后再触发resize
    requestAnimationFrame(() => {
      if (containerRef.current) {
        // 强制更新canvas尺寸
        containerRef.current.style.width = "100%";
        containerRef.current.style.height = "100%";
        window.dispatchEvent(new Event("resize"));
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <header className="fixed top-0 left-0 w-full bg-zinc-900/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Gallery
          </Link>
          <h1 className="text-lg font-medium text-white">{id}</h1>
        </div>
      </header>

      <main className="pt-16">
        <div className={`relative bg-black ${isFullWidth ? "aspect-[21/9]" : "max-w-3xl mx-auto aspect-video"}`}>
          <canvas ref={containerRef} className="w-full h-full" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={handlePlayPause}
              className="px-6 py-2 text-sm font-medium text-white bg-zinc-800/90 hover:bg-zinc-700/90 rounded-full transition-colors backdrop-blur-sm"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 text-sm font-medium text-white bg-zinc-800/90 hover:bg-zinc-700/90 rounded-full transition-colors backdrop-blur-sm"
            >
              Reset
            </button>
            <button
              onClick={handleToggleSize}
              className="px-6 py-2 text-sm font-medium text-white bg-zinc-800/90 hover:bg-zinc-700/90 rounded-full transition-colors backdrop-blur-sm"
            >
              {isFullWidth ? "Shrink" : "Expand"}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
          <section>
            <h2 className="text-xl font-medium text-white">About this Effect</h2>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              This is a detailed description of the effect. It will be dynamically loaded based on the effect ID.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-medium text-white">Implementation Details</h3>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Technical details about how the effect was implemented, including information about the shaders,
              techniques, and algorithms used.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-medium text-white">Controls</h3>
            <ul className="mt-3 space-y-2 text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                Play/Pause: Toggle animation playback
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                Reset: Restart the animation from beginning
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                Mouse: Move cursor over the canvas to interact
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EffectDetail;
