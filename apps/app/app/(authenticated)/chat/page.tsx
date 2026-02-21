"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Card } from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { cn } from "@repo/design-system/lib/utils";
import {
  ArrowRight,
  FileText,
  Loader2,
  Search,
  Send,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Contract = {
  id: string;
  fileName: string;
  contractType: string;
  riskScore: number;
  analyzedAt: string;
  pages: number;
  wordCount: number;
  flagCount: number;
  missingClauses: string[];
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const contracts: Contract[] = [
  {
    id: "1",
    fileName: "client_agreement_v3.pdf",
    contractType: "Freelance Agreement",
    riskScore: 73,
    analyzedAt: "2 hours ago",
    pages: 12,
    wordCount: 4218,
    flagCount: 8,
    missingClauses: ["GDPR Clause", "Auto-renewal Warning", "Mutual NDA"],
  },
  {
    id: "2",
    fileName: "mutual_nda_acme_corp.docx",
    contractType: "NDA",
    riskScore: 32,
    analyzedAt: "1 day ago",
    pages: 6,
    wordCount: 2156,
    flagCount: 3,
    missingClauses: ["Return of Information", "Term Length"],
  },
  {
    id: "3",
    fileName: "saas_terms_of_service.pdf",
    contractType: "SaaS Agreement",
    riskScore: 78,
    analyzedAt: "3 days ago",
    pages: 18,
    wordCount: 5890,
    flagCount: 12,
    missingClauses: ["SLA", "Data Ownership", "Termination for Cause"],
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Is the liability cap mutual or one-sided?",
    timestamp: new Date(Date.now() - 300_000),
  },
  {
    id: "2",
    role: "assistant",
    content:
      "It's entirely one-sided. Section 7.2 places unlimited liability on you, while the client's liability is capped at $500. In standard freelance contracts, caps are mutual and set at 3× the contract value. 🔴 This is a HIGH RISK clause — I recommend negotiating before signing.",
    timestamp: new Date(Date.now() - 295_000),
  },
  {
    id: "3",
    role: "user",
    content: "Suggest better wording for the IP clause",
    timestamp: new Date(Date.now() - 120_000),
  },
  {
    id: "4",
    role: "assistant",
    content: `Replace §9.1 with: "Contractor retains ownership of all pre-existing intellectual property, tools, and methodologies. Client shall own all work product created specifically under this Agreement." This protects your existing toolkit while giving the client ownership of deliverables created specifically under this agreement.`,
    timestamp: new Date(Date.now() - 115_000),
  },
];

const suggestedQuestions = [
  "Is liability mutual?",
  "What's the notice period?",
  "Any non-compete?",
  "Summarize the biggest risks",
];

const getRiskColor = (score: number) => {
  if (score >= 70) {
    return "text-[#ff3b5c]";
  }
  if (score >= 40) {
    return "text-[#f5a623]";
  }
  return "text-[#00d68f]";
};

const getRiskLabel = (score: number) => {
  if (score >= 70) {
    return "High Risk";
  }
  if (score >= 40) {
    return "Medium Risk";
  }
  return "Low Risk";
};

const getRiskBg = (score: number) => {
  if (score >= 70) {
    return "bg-[#ff3b5c]/10";
  }
  if (score >= 40) {
    return "bg-[#f5a623]/10";
  }
  return "bg-[#00d68f]/10";
};

const ChatPage = () => {
  const [selectedContractId, setSelectedContractId] = useState<string>("1");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedContract = contracts.find((c) => c.id === selectedContractId);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Math.random().toString(36),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Math.random().toString(36),
        role: "assistant",
        content:
          "Based on my analysis of the contract, this is a standard clause found in Section 4.2. However, I recommend adding more specific language to protect your interests. Would you like me to suggest improved wording?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const filteredContracts = contracts.filter((c) =>
    c.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      <div className="flex w-60 flex-col border-[#1e1e2e] border-r bg-[#0a0a0f]">
        <div className="border-[#1e1e2e] border-b p-4">
          <h2 className="mb-3 font-semibold text-lg">Your Contracts</h2>
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="border-[#1e1e2e] bg-[#111118] pl-8"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              value={searchQuery}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {filteredContracts.map((contract) => (
              <button
                className={cn(
                  "w-full rounded-lg border-l-2 p-3 text-left transition-colors",
                  selectedContractId === contract.id
                    ? "border-[#a78bfa] bg-[#111118]"
                    : "border-transparent bg-[#0a0a0f] hover:bg-[#111118]"
                )}
                key={contract.id}
                onClick={() => setSelectedContractId(contract.id)}
                type="button"
              >
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-sm">
                    {contract.fileName}
                  </span>
                </div>
                <div className="mb-2">
                  <Badge
                    className="font-mono text-xs"
                    style={{ background: "#1e1e2e", color: "#a78bfa" }}
                    variant="secondary"
                  >
                    {contract.contractType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "font-mono text-xs",
                      getRiskBg(contract.riskScore),
                      getRiskColor(contract.riskScore)
                    )}
                    variant="secondary"
                  >
                    {contract.riskScore}/100
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="border-[#1e1e2e] border-t p-3">
          <Button
            asChild
            className="w-full gap-2 bg-[#a78bfa] hover:bg-[#9b7fe6]"
            size="sm"
          >
            <Link href="/upload">
              <Upload className="h-4 w-4" />
              Upload New
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {selectedContract ? (
          <>
            <div className="flex items-center justify-between border-[#1e1e2e] border-b bg-[#0a0a0f] p-4">
              <div className="flex items-center gap-3">
                <h1 className="font-semibold text-lg">
                  {selectedContract.fileName}
                </h1>
                <Badge
                  className="font-mono text-xs"
                  style={{ background: "#1e1e2e", color: "#a78bfa" }}
                  variant="secondary"
                >
                  {selectedContract.contractType}
                </Badge>
                <Badge
                  className={cn(
                    "gap-1 font-mono text-xs",
                    getRiskBg(selectedContract.riskScore),
                    getRiskColor(selectedContract.riskScore)
                  )}
                  variant="secondary"
                >
                  ⚠️ {selectedContract.riskScore}/100{" "}
                  {getRiskLabel(selectedContract.riskScore)}
                </Badge>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/${selectedContract.id}`}>
                  View Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <h2 className="mb-2 font-semibold text-2xl">
                      Ask me anything about {selectedContract.fileName}
                    </h2>
                    <p className="text-muted-foreground">
                      Get instant answers about clauses, risks, and suggestions
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.map((question) => (
                      <Button
                        key={question}
                        onClick={() => handleSuggestedQuestion(question)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl space-y-4">
                  {messages.map((message) => (
                    <div
                      className={cn(
                        "flex",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                      key={message.id}
                    >
                      {message.role === "user" ? (
                        <div className="max-w-[80%] rounded-2xl bg-linear-to-r from-[#a78bfa] to-[#8b5cf6] px-4 py-3">
                          <p className="text-sm text-white">
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <Card className="max-w-[85%] border-[#1e1e2e] bg-[#111118] p-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </Card>
                      )}
                    </div>
                  ))}

                  {isLoading ? (
                    <div className="flex justify-start">
                      <Card className="border-[#1e1e2e] bg-[#111118] p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-[#a78bfa]" />
                          <span className="text-muted-foreground text-sm">
                            Analyzing...
                          </span>
                        </div>
                      </Card>
                    </div>
                  ) : null}
                </div>
              )}
            </ScrollArea>

            <div className="border-[#1e1e2e] border-t bg-[#0a0a0f] p-4">
              <div className="mx-auto max-w-3xl">
                <div className="mb-2 text-muted-foreground text-xs">
                  Analyzing {selectedContract.fileName}
                </div>
                <div className="flex gap-2">
                  <Input
                    className="flex-1 resize-none border-[#1e1e2e] bg-[#111118]"
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask a question about this contract..."
                    value={inputValue}
                  />
                  <Button
                    className="shrink-0 bg-[#a78bfa] hover:bg-[#9b7fe6]"
                    disabled={!inputValue.trim() || isLoading}
                    onClick={handleSend}
                    size="icon"
                    type="button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 font-semibold text-xl">
                Select a contract to start chatting
              </h2>
              <p className="text-muted-foreground">
                Choose from your analyzed contracts on the left
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedContract ? (
        <div className="hidden w-70 border-[#1e1e2e] border-l bg-[#0a0a0f] lg:block">
          <div className="border-[#1e1e2e] border-b p-4">
            <h2 className="font-semibold text-lg">Contract Summary</h2>
          </div>

          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="space-y-4 p-4">
              <Card className="border-[#1e1e2e] bg-[#111118] p-4">
                <h3 className="mb-3 font-medium text-sm">Key Facts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{selectedContract.contractType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span>{selectedContract.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Word Count:</span>
                    <span>{selectedContract.wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Analyzed:</span>
                    <span>{selectedContract.analyzedAt}</span>
                  </div>
                </div>
              </Card>

              <Card className="border-[#1e1e2e] bg-[#111118] p-4">
                <h3 className="mb-3 font-medium text-sm">Risk Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk</span>
                    <Badge
                      className="font-mono text-xs"
                      style={{ background: "#ff3b5c20", color: "#ff3b5c" }}
                      variant="secondary"
                    >
                      5
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Risk</span>
                    <Badge
                      className="font-mono text-xs"
                      style={{ background: "#f5a62320", color: "#f5a623" }}
                      variant="secondary"
                    >
                      2
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Risk</span>
                    <Badge
                      className="font-mono text-xs"
                      style={{ background: "#00d68f20", color: "#00d68f" }}
                      variant="secondary"
                    >
                      1
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="border-[#1e1e2e] bg-[#111118] p-4">
                <h3 className="mb-3 font-medium text-sm">Top Risks</h3>
                <div className="space-y-2">
                  <button
                    className="w-full rounded-lg bg-[#ff3b5c]/10 px-3 py-2 text-left text-sm transition-colors hover:bg-[#ff3b5c]/20"
                    type="button"
                  >
                    <span className="text-[#ff3b5c]">
                      Unlimited Liability §7.2
                    </span>
                  </button>
                  <button
                    className="w-full rounded-lg bg-[#ff3b5c]/10 px-3 py-2 text-left text-sm transition-colors hover:bg-[#ff3b5c]/20"
                    type="button"
                  >
                    <span className="text-[#ff3b5c]">
                      One-sided IP Transfer §9.1
                    </span>
                  </button>
                  <button
                    className="w-full rounded-lg bg-[#f5a623]/10 px-3 py-2 text-left text-sm transition-colors hover:bg-[#f5a623]/20"
                    type="button"
                  >
                    <span className="text-[#f5a623]">
                      No Termination Rights §12
                    </span>
                  </button>
                </div>
              </Card>

              <Card className="border-[#1e1e2e] bg-[#111118] p-4">
                <h3 className="mb-3 font-medium text-sm">Missing Clauses</h3>
                <div className="space-y-2">
                  {selectedContract.missingClauses.map((clause) => (
                    <div
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                      key={clause}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#f5a623]" />
                      {clause}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
};

export default ChatPage;
