import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { blog } from "@repo/cms";
import { Body } from "@repo/cms/components/body";
import { CodeBlock } from "@repo/cms/components/code-block";
import { Feed } from "@repo/cms/components/feed";
import { Image } from "@repo/cms/components/image";
import { TableOfContents } from "@repo/cms/components/toc";
import { JsonLd } from "@repo/seo/json-ld";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { env } from "@/env";
import { staticPosts } from "../static-posts";

const protocol = env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith("https")
  ? "https"
  : "http";
const url = new URL(`${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`);

type BlogPostProperties = {
  readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: BlogPostProperties): Promise<Metadata> => {
  const { slug } = await params;
  const staticPost = staticPosts.find((p) => p.slug === slug);
  if (staticPost) {
    return createMetadata({
      title: staticPost.title,
      description: staticPost.description,
      image: staticPost.image.url,
    });
  }
  const post = await blog.getPost(slug);
  if (!post) {
    return {};
  }
  return createMetadata({
    title: post._title,
    description: post.description,
    image: post.image.url,
  });
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  const posts = await blog.getPosts();
  return [
    ...posts.map(({ _slug }) => ({ slug: _slug })),
    ...staticPosts.map((p) => ({ slug: p.slug })),
  ];
};

const HIDDEN_SLUGS = ["understanding-gdpr", "gdpr"];
const HIDDEN_TITLES = ["understanding gdpr"];

const BlogPost = async ({ params }: BlogPostProperties) => {
  const { slug } = await params;

  const staticPost = staticPosts.find((p) => p.slug === slug);
  if (staticPost) {
    return (
      <div className="container mx-auto py-16">
        <Link
          className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm focus:underline focus:outline-none"
          href="/blog"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Blog
        </Link>
        <div className="mt-16 flex flex-col items-start gap-8 sm:flex-row">
          <div className="sm:flex-1">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight lg:text-5xl">
                {staticPost.title}
              </h1>
              <p className="not-first:mt-6 text-balance leading-7">
                {staticPost.description}
              </p>
              <NextImage
                alt={staticPost.image.alt}
                className="my-16 h-full w-full rounded-xl object-cover"
                height={630}
                src={staticPost.image.url}
                width={1200}
              />
              <div className="mx-auto max-w-prose">
                {staticPost.body.map((block) =>
                  block.type === "h2" ? (
                    <h2 key={block.text}>{block.text}</h2>
                  ) : (
                    <p key={block.text}>{block.text}</p>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="sticky top-24 hidden shrink-0 md:block">
            <Sidebar
              date={new Date(staticPost.date)}
              readingTime={staticPost.readTime}
              toc={null}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Feed queries={[blog.postQuery(slug)]}>
      {async ([data]) => {
        "use server";
        const page = data.blog.posts.item;
        if (
          !page ||
          HIDDEN_TITLES.some((t) => page._title.toLowerCase().includes(t)) ||
          HIDDEN_SLUGS.some((s) => page._slug.toLowerCase().includes(s))
        ) {
          notFound();
        }
        return (
          <>
            <JsonLd
              code={{
                "@type": "BlogPosting",
                "@context": "https://schema.org",
                datePublished: page.date,
                description: page.description,
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": new URL(`/blog/${page._slug}`, url).toString(),
                },
                headline: page._title,
                image: page.image.url,
                dateModified: page.date,
                author: page.authors.at(0)?._title,
                isAccessibleForFree: true,
              }}
            />
            <div className="container mx-auto py-16">
              <Link
                className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm focus:underline focus:outline-none"
                href="/blog"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Blog
              </Link>
              <div className="mt-16 flex flex-col items-start gap-8 sm:flex-row">
                <div className="sm:flex-1">
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight lg:text-5xl">
                      {page._title}
                    </h1>
                    <p className="not-first:mt-6 text-balance leading-7">
                      {page.description}
                    </p>
                    {page.image ? (
                      <Image
                        alt={page.image.alt ?? ""}
                        className="my-16 h-full w-full rounded-xl"
                        height={page.image.height}
                        priority
                        src={page.image.url}
                        width={page.image.width}
                      />
                    ) : null}
                    <div className="mx-auto max-w-prose">
                      <Body
                        components={{
                          pre: ({ code, language }) => (
                            <CodeBlock
                              snippets={[{ code, language }]}
                              theme="vesper"
                            />
                          ),
                        }}
                        content={page.body.json.content}
                      />
                    </div>
                  </div>
                </div>
                <div className="sticky top-24 hidden shrink-0 md:block">
                  <Sidebar
                    date={new Date(page.date)}
                    readingTime={`${page.body.readingTime} min read`}
                    toc={<TableOfContents data={page.body.json.toc} />}
                  />
                </div>
              </div>
            </div>
          </>
        );
      }}
    </Feed>
  );
};

export default BlogPost;
