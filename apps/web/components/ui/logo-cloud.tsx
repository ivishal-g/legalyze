"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const LOGOS = [
  {
    name: "Google Cloud",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
  },
  {
    name: "AWS",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  },
  {
    name: "Azure",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg",
  },
  {
    name: "OpenAI",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  },
  {
    name: "Vercel",
    url: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png",
  },
  {
    name: "Stripe",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
  },
];

export function LogoCloud() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="group relative mx-auto flex items-center gap-20">
        <div className="flex shrink-0">
          <InfiniteSlider duration={30} gap={112}>
            {LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center justify-center"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="h-8 w-auto max-w-[120px] opacity-60 brightness-0 invert transition-opacity hover:opacity-100"
                />
              </div>
            ))}
          </InfiniteSlider>
        </div>

        <ProgressiveBlur
          className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-linear-to-r from-[#0a0a0f] to-transparent"
          direction="left"
          blurIntensity={0.5}
        />
        <ProgressiveBlur
          className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-linear-to-l from-[#0a0a0f] to-transparent"
          direction="right"
          blurIntensity={0.5}
        />
      </div>
    </section>
  );
}
