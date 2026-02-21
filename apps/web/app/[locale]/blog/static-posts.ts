export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string };

export type StaticPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  image: { url: string; alt: string };
  body: PostBlock[];
};

export const staticPosts: StaticPost[] = [
  {
    slug: "what-is-ai-contract-analysis",
    title: "What Is AI Contract Analysis?",
    description:
      "A plain-English introduction to how artificial intelligence reads, understands, and flags risks in legal contracts — and why it matters for everyone who signs documents.",
    date: "February 18, 2026",
    readTime: "5 min read",
    image: {
      url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
      alt: "Person reviewing documents at a desk",
    },
    body: [
      { type: "p", text: "Every week, millions of people sign contracts they have not fully read. Employment agreements, freelance terms, SaaS subscriptions, lease agreements — the list goes on. Most of the time nothing bad happens. But when it does, the consequences can be severe." },
      { type: "h2", text: "How AI Reads a Contract" },
      { type: "p", text: "Modern AI contract analysis tools use large language models — the same technology behind conversational AI assistants — trained on vast collections of legal text. These models have learned to recognise the patterns that signal risk: phrases like 'sole discretion', 'without limitation', 'in perpetuity', and 'indemnify against any and all claims'." },
      { type: "p", text: "When you upload a contract to Legalyze, the AI reads every clause and compares it against thousands of example contracts. It identifies language that is unusual, one-sided, or known to cause disputes — and flags it with a plain-English explanation." },
      { type: "h2", text: "Risk Scoring" },
      { type: "p", text: "Legalyze assigns a risk score between 0 and 100 to every contract. A score above 70 means you should not sign without negotiating changes. A score below 30 means the contract is broadly reasonable. The score is calculated from the number of flagged clauses, their severity, and the overall balance of the agreement." },
      { type: "h2", text: "What AI Cannot Do" },
      { type: "p", text: "AI is excellent at spotting patterns — but it cannot replace context. It does not know your negotiating leverage, your industry norms, or your personal risk tolerance. For high-value contracts, use AI analysis as a first pass, then involve a qualified solicitor for the final review." },
      { type: "p", text: "Think of Legalyze as your first line of defence — fast, thorough, and always available." },
    ],
  },
  {
    slug: "agentic-ai-in-legal-tech",
    title: "The Rise of Agentic AI in Legal Technology",
    description:
      "Agentic AI goes beyond answering questions — it takes actions, reasons through multi-step problems, and operates autonomously. Here is what that means for the future of legal work.",
    date: "February 15, 2026",
    readTime: "6 min read",
    image: {
      url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
      alt: "Abstract AI neural network visualization",
    },
    body: [
      { type: "p", text: "For the past few years, AI in legal technology has been largely reactive — you ask a question, it gives an answer. That paradigm is changing fast." },
      { type: "h2", text: "What Makes AI 'Agentic'?" },
      { type: "p", text: "An agentic AI system doesn't just respond — it pursues a goal through a series of autonomous steps. It can read a document, identify what it needs to know, search for relevant information, reason about what it finds, and produce a structured output — all without human intervention at each step." },
      { type: "p", text: "In contract analysis, this means an agent can: upload and parse a PDF, identify all obligations and deadlines, cross-reference them against standard market terms, flag deviations, generate suggested redlines, and produce a summary — in one uninterrupted workflow." },
      { type: "h2", text: "Why It Matters for Legal Work" },
      { type: "p", text: "Traditional legal AI tools required significant human orchestration. You had to ask the right questions in the right order. Agentic systems remove that friction. They complete the full review workflow autonomously, surfacing only the decisions that genuinely require human judgment." },
      { type: "h2", text: "Legalyze and Agentic Architecture" },
      { type: "p", text: "Legalyze is built on an agentic foundation. When you upload a contract, our AI agent doesn't just scan for keywords — it reads the document as a whole, understands the context of each clause relative to the others, and produces a complete risk report. Future versions will negotiate on your behalf, proposing and accepting redlines automatically within parameters you set." },
      { type: "p", text: "The legal industry is at the beginning of a profound shift. Agentic AI will not replace lawyers — but it will make expert-level contract review accessible to everyone." },
    ],
  },
  {
    slug: "five-clauses-every-nda-needs",
    title: "5 Clauses Every NDA Must Have",
    description:
      "Non-disclosure agreements are the most frequently signed contracts in business — and the most frequently misunderstood. Here are the five clauses that determine whether yours actually protects you.",
    date: "February 10, 2026",
    readTime: "5 min read",
    image: {
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
      alt: "Legal documents and fountain pen",
    },
    body: [
      { type: "p", text: "A one-page NDA and a twenty-page NDA can offer completely different levels of protection. What separates them is not length — it is the presence of five specific clauses. If yours is missing any of them, it may not be enforceable when you need it most." },
      { type: "h2", text: "1. A Precise Definition of Confidential Information" },
      { type: "p", text: "The most important clause in any NDA defines exactly what information is protected. Broad definitions — 'any information disclosed' — are easier to enforce but give the receiving party little guidance. Narrow definitions list specific categories. Whatever the approach, vagueness is the enemy." },
      { type: "h2", text: "2. Clear Exclusions" },
      { type: "p", text: "Every well-drafted NDA excludes information that was already public, that the receiving party already knew, that they independently developed, or that they received legitimately from a third party. Without these exclusions, the NDA is likely unenforceable." },
      { type: "h2", text: "3. A Defined Duration" },
      { type: "p", text: "Perpetual NDAs are unusual outside of employment contexts. For commercial relationships, two to three years is standard. Specify a clear end date — and consider whether certain categories of information (trade secrets, for example) deserve longer protection." },
      { type: "h2", text: "4. Permitted Disclosure" },
      { type: "p", text: "Both parties need to be able to share information with their own lawyers, accountants, and employees on a need-to-know basis. The NDA should permit this, subject to those recipients being bound by equivalent confidentiality obligations." },
      { type: "h2", text: "5. A Governing Law and Jurisdiction Clause" },
      { type: "p", text: "If a dispute arises, which country's law applies and which courts have jurisdiction? Without this clause, you may find yourself litigating in an inconvenient forum under unfamiliar law. Always specify this upfront." },
    ],
  },
  {
    slug: "how-legalyze-flags-risky-clauses",
    title: "How Legalyze Flags Risky Clauses",
    description:
      "A behind-the-scenes look at the process Legalyze uses to analyse a contract — from upload to risk report — and what happens at each stage.",
    date: "February 5, 2026",
    readTime: "4 min read",
    image: {
      url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
      alt: "Person working on a laptop with data on screen",
    },
    body: [
      { type: "p", text: "Uploading a contract to Legalyze takes about three seconds. Getting the full risk report takes under ten. Here is what happens in between." },
      { type: "h2", text: "Step 1: Document Parsing" },
      { type: "p", text: "Legalyze accepts PDF and DOCX files up to 10MB. The first step is extraction — converting the document into structured text that the AI can process. We handle complex layouts, tables, footnotes, and multi-column PDFs." },
      { type: "h2", text: "Step 2: Clause Segmentation" },
      { type: "p", text: "The AI divides the contract into individual clauses and labels each one by type: liability, IP assignment, termination, payment, confidentiality, non-compete, and so on. This segmentation is essential — a clause's risk level depends entirely on its type and context." },
      { type: "h2", text: "Step 3: Risk Assessment" },
      { type: "p", text: "Each clause is scored against a database of market-standard terms. Clauses that deviate significantly from the norm — in either direction — are flagged. The AI explains in plain English why a clause is risky and what a fairer version would look like." },
      { type: "h2", text: "Step 4: Report Generation" },
      { type: "p", text: "Legalyze produces a structured report: an overall risk score, a list of flagged clauses ordered by severity, a plain-English summary of the contract's key terms, and suggested redlines you can send directly to the other party." },
      { type: "p", text: "The entire process runs in parallel — all clauses are assessed simultaneously — which is why the full report is available in under ten seconds regardless of document length." },
    ],
  },
  {
    slug: "why-freelancers-need-contract-review",
    title: "Why Every Freelancer Needs a Contract Review Tool",
    description:
      "Freelancers sign more contracts than almost anyone — and have the least time and money to deal with the consequences of a bad one. Here is why AI contract review is essential.",
    date: "January 28, 2026",
    readTime: "5 min read",
    image: {
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
      alt: "Freelancer working on a laptop",
    },
    body: [
      { type: "p", text: "A full-time employee has HR. A startup has in-house counsel. A freelancer has themselves. And yet freelancers sign contracts constantly — client agreements, platform terms, subcontracting agreements, collaboration deals. Most are written by the other party's lawyer, for the other party's benefit." },
      { type: "h2", text: "The Asymmetry Problem" },
      { type: "p", text: "Clients who regularly engage freelancers refine their contracts over years of experience. Every clause that was ever disputed gets tightened in the client's favour. By the time a contract reaches a new freelancer, it has been optimised against them — and they have no idea." },
      { type: "h2", text: "The Cost of Getting It Wrong" },
      { type: "p", text: "A freelance contract that assigns all intellectual property to the client — including work created before the engagement — can invalidate your whole portfolio. An uncapped liability clause can make you personally responsible for damages far exceeding your project fee. These aren't hypothetical risks; they are the subject of real disputes, every day." },
      { type: "h2", text: "What to Look for" },
      { type: "p", text: "The four clauses that cause the most problems for freelancers are: IP assignment (check the scope), liability (check for a cap), termination (check for a kill fee), and non-compete (check the duration and breadth). Legalyze flags all four automatically and explains the implications in plain English." },
      { type: "p", text: "You don't need to become a lawyer. You just need to know enough to ask the right questions — and Legalyze makes sure you always do." },
    ],
  },
  {
    slug: "understanding-indemnification-clauses",
    title: "Understanding Indemnification Clauses",
    description:
      "Indemnification clauses are one of the most consequential parts of any contract — and one of the least understood. Here is what they mean and what to watch out for.",
    date: "January 20, 2026",
    readTime: "6 min read",
    image: {
      url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
      alt: "Business professionals in a discussion",
    },
    body: [
      { type: "p", text: "Indemnification clauses determine who pays when something goes wrong. They are standard in almost every commercial contract — but their scope varies enormously, and a poorly negotiated indemnity can be financially ruinous." },
      { type: "h2", text: "What Indemnification Means" },
      { type: "p", text: "To indemnify someone means to compensate them for a loss or liability. In a contract, an indemnification clause typically says: 'Party A agrees to indemnify Party B against any claims, losses, or expenses arising out of [specified circumstances].' If those circumstances arise, Party A pays — regardless of fault." },
      { type: "h2", text: "The Three Things to Check" },
      { type: "p", text: "First: what triggers the indemnity? 'Any claims arising out of your use of the service' is extremely broad. 'Claims arising directly from your material breach of this agreement' is far more reasonable. The trigger should be tied to actual fault, not just association." },
      { type: "p", text: "Second: is there a cap? Unlimited indemnification obligations are dangerous. Always negotiate a financial ceiling — typically equal to the fees paid under the contract, with carve-outs only for fraud and wilful misconduct." },
      { type: "p", text: "Third: is it mutual? Many contracts ask you to indemnify the other party but do not offer reciprocal protection. Insist on symmetry wherever possible." },
      { type: "h2", text: "IP Indemnification" },
      { type: "p", text: "A specific type of indemnification that appears in most technology contracts requires one party to indemnify the other against intellectual property infringement claims. If you are providing software or creative work, you will typically be asked to indemnify the client if your work turns out to infringe a third party's IP. This is standard — but make sure the obligation only covers your work as delivered, not modifications the client makes." },
      { type: "p", text: "Legalyze flags indemnification clauses automatically, explains the trigger and scope in plain English, and suggests balanced alternatives you can propose to the other side." },
    ],
  },
];
