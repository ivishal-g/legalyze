import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { FileCheck, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { env } from "@/env";

export const Hero = async () => (
  <div className="w-full">
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
        <div>
          <Badge className="gap-2 px-4 py-2" variant="secondary">
            <Sparkles className="h-4 w-4" />
            AI Agent for Legal Document Red-Flagging
          </Badge>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="max-w-4xl text-center font-regular text-5xl tracking-tighter md:text-7xl">
            Transform hours of legal review into{" "}
            <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              seconds
            </span>
          </h1>
          <p className="max-w-3xl text-center text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
            Upload any contract → AI spots risks + missing protections → Get a
            clear report + smart fixes instantly. No legal expertise required.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-4" size="lg">
            <Link href={env.NEXT_PUBLIC_APP_URL}>
              <Upload className="h-4 w-4" />
              Upload Contract
            </Link>
          </Button>
          <Button asChild className="gap-4" size="lg" variant="outline">
            <Link href="#demo">
              <FileCheck className="h-4 w-4" />
              See How It Works
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
              <span className="font-semibold text-green-600">⚡</span>
            </div>
            <span>&lt; 10 second analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
              <span className="font-semibold text-blue-600">🎯</span>
            </div>
            <span>5+ risk categories</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
              <span className="font-semibold text-purple-600">📄</span>
            </div>
            <span>One-click redline export</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
