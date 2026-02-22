"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

type ProgressiveBlurProps = {
  className?: string;
  direction?: "top" | "bottom" | "left" | "right";
  blurLayers?: number;
  blurIntensity?: number;
};

export function ProgressiveBlur({
  className,
  direction = "bottom",
  blurLayers = 8,
  blurIntensity = 0.25,
}: ProgressiveBlurProps) {
  const getGradientDirection = () => {
    switch (direction) {
      case "top":
        return "to bottom";
      case "bottom":
        return "to top";
      case "left":
        return "to right";
      case "right":
        return "to left";
      default:
        return "to top";
    }
  };

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
      style={{
        maskImage: `linear-gradient(${getGradientDirection()}, transparent 0%, black 100%)`,
        WebkitMaskImage: `linear-gradient(${getGradientDirection()}, transparent 0%, black 100%)`,
      }}
    >
      {Array.from({ length: blurLayers }).map((_, index) => {
        const blur = (index + 1) * blurIntensity;
        const position = (index / blurLayers) * 100;
        const nextPosition = ((index + 1) / blurLayers) * 100;

        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: `linear-gradient(${getGradientDirection()}, 
                transparent ${position}%, 
                black ${nextPosition}%, 
                black ${nextPosition}%, 
                transparent ${nextPosition}%)`,
              WebkitMaskImage: `linear-gradient(${getGradientDirection()}, 
                transparent ${position}%, 
                black ${nextPosition}%, 
                black ${nextPosition}%, 
                transparent ${nextPosition}%)`,
            }}
          />
        );
      })}
    </div>
  );
}
