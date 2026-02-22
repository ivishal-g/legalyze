/** biome-ignore-all lint/correctness/noUnusedImports: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/nursery/noLeakedRender: <explanation> */
"use client";
import { UserButton, useUser } from "@repo/auth/client";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import type { Dictionary } from "@repo/internationalization";
import { Scale } from "lucide-react";
import Link from "next/link";
import { env } from "@/env";

type HeaderProps = {
  dictionary: Dictionary;
};

export const Header = ({ dictionary }: HeaderProps) => {
  const { isSignedIn, user } = useUser();

  return (
    <header className="sticky top-0 left-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto grid h-16 grid-cols-3 items-center">
        {/* Left: Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">{dictionary.web.header.home}</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/blog">{dictionary.web.header.blog}</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/contact">{dictionary.web.header.contact}</Link>
          </Button>
        </nav>

        {/* Center: Logo */}
        <Link className="flex items-center justify-center gap-2.5" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Legalyze</span>
        </Link>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-2">
          <ModeToggle />
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                className="hidden font-medium text-sm sm:block"
                href={`${env.NEXT_PUBLIC_APP_URL}`}
              >
                {user?.firstName || "Dashboard"}
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}>
                  {dictionary.web.header.signIn}
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-up`}>
                  {dictionary.web.header.signUp}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
