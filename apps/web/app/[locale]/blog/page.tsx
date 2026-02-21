import { blog } from "@repo/cms";
import { Feed } from "@repo/cms/components/feed";
import { Image } from "@repo/cms/components/image";
import { getDictionary } from "@repo/internationalization";
import type { Blog, WithContext } from "@repo/seo/json-ld";
import { JsonLd } from "@repo/seo/json-ld";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { staticPosts } from "./static-posts";

type BlogProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: BlogProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  return createMetadata(dictionary.web.blog.meta);
};

const HIDDEN_SLUGS = ["understanding-gdpr", "gdpr", "gdpr-guide"];
const HIDDEN_TITLES = ["understanding gdpr"];

const BlogIndex = async ({ params }: BlogProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  const jsonLd: WithContext<Blog> = {
    "@type": "Blog",
    "@context": "https://schema.org",
  };

  return (
    <>
      <JsonLd code={jsonLd} />
      <div className="w-full py-16 lg:py-24">
        <div className="container mx-auto flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full border bg-muted px-4 py-1.5 text-muted-foreground text-sm">
              Legalyze Blog
            </div>
            <h1 className="max-w-2xl font-bold text-4xl tracking-tight md:text-5xl">
              Insights on{" "}
              <span className="bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Contracts &amp; AI
              </span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
              {dictionary.web.blog.meta.description}
            </p>
          </div>

          <Feed queries={[blog.postsQuery]}>
            {async ([data]) => {
              "use server";
              const visiblePosts = data.blog.posts.items.filter(
                (p) =>
                  !(
                    HIDDEN_SLUGS.some((s) =>
                      p._slug.toLowerCase().includes(s)
                    ) ||
                    HIDDEN_TITLES.some((t) =>
                      p._title.toLowerCase().includes(t)
                    )
                  )
              );
              if (!visiblePosts.length) {
                return null;
              }
              return (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visiblePosts.map((post) => (
                    <Link
                      className="group hover:-translate-y-0.5 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md"
                      href={`/blog/${post._slug}`}
                      key={post._slug}
                    >
                      <div className="overflow-hidden">
                        <Image
                          alt={post.image.alt ?? ""}
                          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          height={post.image.height}
                          src={post.image.url}
                          width={post.image.width}
                        />
                      </div>
                      <div className="flex flex-col gap-2 p-5">
                        <p className="text-muted-foreground text-xs">
                          {post.date}
                        </p>
                        <h3 className="font-semibold text-base leading-snug">
                          {post._title}
                        </h3>
                        <p className="line-clamp-2 text-muted-foreground text-sm">
                          {post.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            }}
          </Feed>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staticPosts.map((post) => (
              <Link
                className="group hover:-translate-y-0.5 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md"
                href={`/blog/${post.slug}`}
                key={post.slug}
              >
                <div className="overflow-hidden">
                  <NextImage
                    alt={post.image.alt}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    height={630}
                    src={post.image.url}
                    width={1200}
                  />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span>{post.date}</span>
                    <span />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-semibold text-base leading-snug">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                    {post.description}
                  </p>
                  <span className="mt-1 font-medium text-sm text-violet-500 group-hover:underline">
                    Read article{" "}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogIndex;
