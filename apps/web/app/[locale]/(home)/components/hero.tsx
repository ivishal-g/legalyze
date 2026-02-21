import type { Dictionary } from "@repo/internationalization";
import { FileText, MessageSquare, Upload } from "lucide-react";
import Link from "next/link";
import { env } from "@/env";

type HeroProps = {
  dictionary: Dictionary;
};

const steps = [
  {
    icon: Upload,
    step: "01",
    label: "Upload contract",
    sub: "PDF or DOCX, up to 10MB",
  },
  {
    icon: FileText,
    step: "02",
    label: "AI scans for risks",
    sub: "Flags clauses, scores risk 0–100",
  },
  {
    icon: MessageSquare,
    step: "03",
    label: "Get report + fixes",
    sub: "Plain-English summary + redline export",
  },
];

export const Hero = ({ dictionary }: HeroProps) => (
  <div className="w-full">
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center gap-10 py-16 lg:py-24">
        {/* Badge */}
        <div className="rounded-full border bg-muted px-4 py-1.5 text-muted-foreground text-sm">
          {dictionary.web.home.hero.badge}
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-4">
          <h1 className="max-w-3xl text-center font-bold text-4xl tracking-tight md:text-6xl">
            Transform Hours of Legal Review Into{" "}
            <span className="bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Seconds
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-center text-base text-muted-foreground leading-relaxed md:text-lg">
            {dictionary.web.home.meta.description}
          </p>
        </div>

        {/* Step cards */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div className="group relative flex" key={step.step}>
              {/* Connector line between cards */}
              {i < steps.length - 1 && (
                <div className="-right-2 absolute top-10 z-10 hidden h-px w-4 bg-linear-to-r from-border to-transparent sm:block" />
              )}
              <Link
                className="hover:-translate-y-0.5 flex h-full w-full cursor-pointer flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-transform duration-200"
                href={`${env.NEXT_PUBLIC_APP_URL}/sign-up`}
              >
                {/* Icon + step number */}
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                    <step.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="font-bold font-mono text-2xl text-muted-foreground/40 leading-none">
                    {step.step}
                  </span>
                </div>
                {/* Text */}
                <div className="flex flex-col gap-1">
                  <p className="bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text font-semibold text-base text-transparent leading-snug">
                    {step.label}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.sub}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
