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
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
} from "../../../components/prompt-input";

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

const suggestedQuestions = [
  "Is liability mutual?",
  "What's the notice period?",
  "Any non-compete?",
  "Summarize the biggest risks",
];

const getRiskColor = (score: number) => {
  if (score >= 70) return "text-[#ff3b5c]";
  if (score >= 40) return "text-[#f5a623]";
  return "text-[#00d68f]";
};

const getRiskLabel = (score: number) => {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Medium Risk";
  return "Low Risk";
};

const getRiskBg = (score: number) => {
  if (score >= 70) return "bg-[#ff3b5c]/10";
  if (score >= 40) return "bg-[#f5a623]/10";
  return "bg-[#00d68f]/10";
};

const ChatPage = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);

  const { messages, isLoading, append } = useChat({
    api: "/api/chat/doc",
    body: {
      contractId: selectedContractId,
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const handlePromptSubmit = async (message: {
    text: string;
    files: Array<{
      type: "file";
      url: string;
      mediaType?: string;
      filename?: string;
    }>;
  }) => {
    if (!message.text.trim() || isLoading) return;

    // Append message with text and files
    await append({
      role: "user",
      content: message.text,
      experimental_attachments: message.files.length > 0 ? message.files : undefined,
    });
  };

  // Fetch contracts on mount
  useEffect(() => {
    async function loadContracts() {
      try {
        const response = await fetch("/api/contracts");
        if (response.ok) {
          const data = await response.json();
          setContracts(data);
          if (data.length > 0) {
            setSelectedContractId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load contracts:", error);
      } finally {
        setIsLoadingContracts(false);
      }
    }
    loadContracts();
  }, []);

  const selectedContract = contracts.find((c) => c.id === selectedContractId);

  const filteredContracts = contracts.filter((c) =>
    c.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Contracts List */}
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
          {isLoadingContracts ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#a78bfa]" />
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {filteredContracts.map((contract) => (
                <button
                  className={cn(
                    "w-full rounded-lg border-l-2 p-3 text-left transition-colors",
                    selectedContractId === contract.id
                      ? "border-[#a78bfa] bg-[#111118]"
                      : "border-transparent bg-[#0a0a0f] hover:bg-[#111118]",
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
                        getRiskColor(contract.riskScore),
                      )}
                      variant="secondary"
                    >
                      {contract.riskScore}/100
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
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

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedContract ? (
          <>
            {/* Header */}
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
                    getRiskColor(selectedContract.riskScore),
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

            {/* Chat Messages */}
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
                        onClick={() => handlePromptSubmit({ text: question, files: [] })}
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
                          : "justify-start",
                      )}
                      key={message.id}
                    >
                      {message.role === "user" ? (
                        <div className="max-w-[80%] rounded-2xl bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] px-4 py-3">
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

                  {isLoading && (
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
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-[#1e1e2e] border-t bg-[#0a0a0f] p-4">
              <div className="mx-auto max-w-3xl">
                <div className="mb-2 text-muted-foreground text-xs">
                  Analyzing {selectedContract.fileName}
                </div>
                <PromptInput
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onSubmit={handlePromptSubmit}
                  className="w-full"
                >
                  <PromptInputAttachments>
                    {(attachment) => <PromptInputAttachment data={attachment} />}
                  </PromptInputAttachments>
                  <PromptInputBody>
                    <PromptInputTextarea
                      placeholder="Ask a question about this contract..."
                      disabled={isLoading}
                    />
                  </PromptInputBody>
                  <PromptInputFooter>
                    <PromptInputTools>
                      <PromptInputActionMenu>
                        <PromptInputActionMenuTrigger />
                        <PromptInputActionMenuContent>
                          <PromptInputActionAddAttachments />
                        </PromptInputActionMenuContent>
                      </PromptInputActionMenu>
                    </PromptInputTools>
                    <PromptInputSubmit
                      className="bg-[#a78bfa] hover:bg-[#9b7fe6]"
                      disabled={isLoading}
                    />
                  </PromptInputFooter>
                </PromptInput>
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

      {/* Right Sidebar - Contract Summary */}
      {selectedContract && (
        <div className="hidden w-70 border-[#1e1e2e] border-l bg-[#0a0a0f] lg:block">
          {/* ...existing code... */}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
