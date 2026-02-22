import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";

const teamMembers = [
  {
    name: "Kartik Jagdale",
    role: "Frontend Engineer",
    detail: "2nd Year CS",
    initials: "KJ",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Vishal Gaikwad",
    role: "Backend Engineer",
    detail: "2nd Year CS",
    initials: "VG",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    name: "Krishna Aundhekar",
    role: "DevOps Engineer",
    detail: "2nd Year IT",
    initials: "KA",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    name: "Saad Shaikh",
    role: "AI/ML Engineer",
    detail: "2nd Year IT",
    initials: "SS",
    gradient: "from-fuchsia-500 to-purple-600",
  },
];

export const metadata: Metadata = createMetadata({
  title: "Team Details — Legalyze",
  description:
    "Meet the talented team behind Legalyze — engineers building AI-powered contract analysis.",
});

const TeamPage = () => (
  <div className="w-full">
    <div className="container mx-auto">
      <div className="flex flex-col items-center gap-12 py-16 lg:py-24">
        {/* Title with ❖ square bullet */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full border bg-muted px-4 py-1.5 text-muted-foreground text-sm">
            Team Hello World
          </div>
          <h1 className="flex items-center gap-3 text-center font-bold text-4xl tracking-tight md:text-6xl">
            <span className="bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              ❖
            </span>{" "}
            Team Details
          </h1>
          <p className="mx-auto max-w-xl text-center text-base text-muted-foreground leading-relaxed md:text-lg">
            The passionate engineers building the future of AI-powered contract
            analysis.
          </p>
        </div>

        {/* Team member cards */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          {teamMembers.map((member) => (
            <div
              className="agroup hover:-translate-y-1 relative flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              key={member.name}
            >
              {/* Avatar + Info */}
              <div className="flex items-start gap-4">
                {/* Gradient avatar */}
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${member.gradient} font-bold text-lg text-white shadow-md`}
                >
                  {member.initials}
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-lg tracking-tight">
                    {member.name}
                  </h3>
                  <p className="bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text font-medium text-sm text-transparent">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Detail badge */}
              <div className="flex items-center gap-2">
                <span className="bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-sm text-transparent">
                  ❖
                </span>
                <span className="text-muted-foreground text-sm">
                  {member.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default TeamPage;
