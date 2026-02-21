"use client";

import type { Dictionary } from "@repo/internationalization";

type CasesProps = {
  dictionary: Dictionary;
};

const logos = [
  { name: "LexisCorp", bg: "#2563EB", initials: "LC" },
  { name: "ArgoLegal", bg: "#7C3AED", initials: "AL" },
  { name: "TrustBase", bg: "#0D9488", initials: "TB" },
  { name: "ClarityAI", bg: "#EA580C", initials: "CA" },
  { name: "VaultSign", bg: "#DC2626", initials: "VS" },
  { name: "NexaDocs", bg: "#4F46E5", initials: "ND" },
  { name: "CoreBridge", bg: "#16A34A", initials: "CB" },
  { name: "SignFlow", bg: "#DB2777", initials: "SF" },
  { name: "ContractIQ", bg: "#D97706", initials: "CQ" },
];

const track = [...logos, ...logos];

export const Cases = ({ dictionary }: CasesProps) => (
  <div className="w-full overflow-hidden py-8 lg:py-12">
    <div className="container mx-auto">
      <p className="mb-8 text-center text-muted-foreground text-sm">
        {dictionary.web.home.cases.title}
      </p>
    </div>
    <div className="mask-[linear-gradient(to_right,transparent,white_8%,white_92%,transparent)] relative flex overflow-hidden">
      <div
        className="flex shrink-0 animate-[marquee_28s_linear_infinite] gap-6"
        style={{ minWidth: "max-content" }}
      >
        {track.map((logo, i) => (
          <div
            className="flex h-28 w-48 flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/50 shadow-sm transition-colors hover:bg-muted"
            key={`${logo.name}-${i}`}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl font-bold text-base text-white shadow-md"
              style={{ backgroundColor: logo.bg }}
            >
              {logo.initials}
            </div>
            <span className="font-semibold text-foreground text-sm">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
