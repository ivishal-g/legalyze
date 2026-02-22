"use client";

import type { Dictionary } from "@repo/internationalization";

import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

type CasesProps = {
  dictionary: Dictionary;
};

const LOGOS = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg", alt: "Google Cloud" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg", alt: "AWS" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg", alt: "Azure" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", alt: "OpenAI" },
  { src: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png", alt: "Vercel" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg", alt: "Stripe" },
];

export function Cases({ dictionary }: CasesProps) {
  const logos = LOGOS;
  return (
    <section>
        <h2 className="mb-5 text-center">
          <span className="block font-medium text-2xl text-muted-foreground">
            Already used by
          </span>
          <span className="font-black text-2xl text-primary tracking-tight md:text-3xl">
            Best in the Game
          </span>
        </h2>
    <div className="relative mx-auto max-w-3xl bg-linear-to-r from-secondary via-transparent to-secondary py-13  md:border-x">
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t" />

      <InfiniteSlider gap={42} reverse speed={60} speedOnHover={20}>
        {logos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
            height="auto"
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width="auto"
          />
        ))}
      </InfiniteSlider>

      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 left-0 h-full w-40"
        direction="left"
      />
      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 right-0 h-full w-40"
        direction="right"
      />

      <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b" />
    </div>
    </section>
  );
}
