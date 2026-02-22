import { legal } from "@repo/cms";
import { Feed } from "@repo/cms/components/feed";
import { Scale } from "lucide-react";
import Link from "next/link";
import { env } from "@/env";

export const Footer = () => (
  <Feed queries={[legal.postsQuery]}>
    {async ([data]) => {
      "use server";
      await Promise.resolve();

      const navigationItems = [
        {
          title: "Home",
          href: "/",
          description: "",
        },
        {
          title: "Pages",
          description: "Managing a small business today is already tough.",
          items: [
            {
              title: "Blog",
              href: "/blog",
            },
            {
              title: "Team",
              href: "/team",
            },
          ],
        },
        {
          title: "Legal",
          description: "We stay on top of the latest legal requirements.",
          items: data.legalPages.items.map((post) => ({
            title: post._title,
            href: `/legal/${post._slug}`,
          })),
        },
      ];

      if (env.NEXT_PUBLIC_DOCS_URL) {
        navigationItems.at(1)?.items?.push({
          title: "Docs",
          href: env.NEXT_PUBLIC_DOCS_URL,
        });
      }

      return (
        <section className="dark border-foreground/10 border-t">
          <div className="w-full bg-background py-20 text-foreground lg:py-40">
            <div className="container mx-auto">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div className="flex flex-col items-start gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Scale className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <h2 className="font-bold text-2xl tracking-tight">
                        Legalyze
                      </h2>
                    </div>
                    <p className="max-w-lg text-left text-foreground/75 text-lg leading-relaxed tracking-tight">
                      AI-powered contract analysis. Protect yourself before you
                      sign.
                    </p>
                  </div>
                </div>
                <div className="grid items-start gap-10 lg:grid-cols-3">
                  {navigationItems.map((item) => (
                    <div
                      className="flex flex-col items-start gap-1 text-base"
                      key={item.title}
                    >
                      <div className="flex flex-col gap-2">
                        {item.href ? (
                          <Link
                            className="flex items-center justify-between"
                            href={item.href}
                            {...(item.href.includes("http") && {
                              rel: "noopener noreferrer",
                              target: "_blank",
                            })}
                          >
                            <span className="text-xl">{item.title}</span>
                          </Link>
                        ) : (
                          <p className="text-xl">{item.title}</p>
                        )}
                        {item.items?.map((subItem) => (
                          <Link
                            className="flex items-center justify-between"
                            href={subItem.href}
                            key={subItem.title}
                            {...(subItem.href.includes("http") && {
                              rel: "noopener noreferrer",
                              target: "_blank",
                            })}
                          >
                            <span className="text-foreground/75">
                              {subItem.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }}
  </Feed>
);
