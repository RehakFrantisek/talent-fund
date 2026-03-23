"use client";

import { type ReactNode, useRef, useState } from "react";

type HorizontalSliderProps = {
  children: ReactNode;
  className?: string;
};

export default function HorizontalSlider({ children, className = "" }: HorizontalSliderProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const dragData = useRef({ startX: 0, startScrollLeft: 0 });

  const scrollByAmount = (amount: number) => {
    sliderRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByAmount(-320)}
        className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-lg shadow-sm transition hover:scale-105 hover:border-amber-300 hover:bg-white md:flex"
        aria-label="Posunout doleva"
      >
        <span aria-hidden>‹</span>
      </button>

      <div
        ref={sliderRef}
        className={`-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} ${className}`}
        onPointerDown={(event) => {
          if (!sliderRef.current) return;
          setIsPointerDown(true);
          dragData.current = {
            startX: event.pageX,
            startScrollLeft: sliderRef.current.scrollLeft,
          };
        }}
        onPointerLeave={() => {
          setIsDragging(false);
          setIsPointerDown(false);
        }}
        onPointerUp={() => {
          setIsDragging(false);
          setIsPointerDown(false);
        }}
        onPointerMove={(event) => {
          if (!isPointerDown || !sliderRef.current) return;
          event.preventDefault();
          const delta = event.pageX - dragData.current.startX;
          if (!isDragging && Math.abs(delta) > 4) {
            setIsDragging(true);
          }
          sliderRef.current.scrollLeft = dragData.current.startScrollLeft - delta;
        }}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(320)}
        className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-lg shadow-sm transition hover:scale-105 hover:border-amber-300 hover:bg-white md:flex"
        aria-label="Posunout doprava"
      >
        <span aria-hidden>›</span>
      </button>
    </div>
  );
}
