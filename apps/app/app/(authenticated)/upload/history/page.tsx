"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Card } from "@repo/design-system/components/ui/card";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { cn } from "@repo/design-system/lib/utils";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Contract = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  status: string;
  contractType?: string;
  riskScore?: number;
  createdAt: string;
  analyzedAt?: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / k ** i)} ${sizes[i]}`;
};

const getRiskColor = (score: number) => {
  if (score >= 70) {
    return "text-[#ff3b5c]";
  }
  if (score >= 40) {
    return "text-[#f5a623]";
  }
  return "text-[#00d68f]";
};

const getRiskBgColor = (score: number) => {
  if (score >= 70) {
    return "bg-[#ff3b5c]/10";
  }
  if (score >= 40) {
    return "bg-[#f5a623]/10";
  }
  return "bg-[#00d68f]/10";
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "LEGAL":
      return { bg: "#a78bfa20", color: "#a78bfa" };
    case "BUSINESS":
      return { bg: "#3b82f620", color: "#3b82f6" };
    case "EDUCATIONAL":
      return { bg: "#10b98120", color: "#10b981" };
    case "ADMINISTRATIVE":
      return { bg: "#f5a62320", color: "#f5a623" };
    default:
      return { bg: "#1e1e2e", color: "#a78bfa" };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETE":
      return { bg: "#00d68f20", color: "#00d68f", label: "Complete" };
    case "PROCESSING":
      return { bg: "#f5a62320", color: "#f5a623", label: "Processing" };
    case "UPLOADING":
      return { bg: "#a78bfa20", color: "#a78bfa", label: "Uploading" };
    case "ERROR":
      return { bg: "#ff3b5c20", color: "#ff3b5c", label: "Error" };
    default:
      return { bg: "#1e1e2e", color: "#888", label: status };
  }
};

const HistoryPage = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/contracts?limit=100");
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts);
      }
    } catch (error) {
      console.error("Failed to fetch upload history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-semibold text-3xl">Upload History</h1>
          <p className="text-muted-foreground">
            View all your previously uploaded contracts and their analysis
            results
          </p>
        </div>
        <Badge
          className="font-mono text-xs"
          style={{ background: "#a78bfa20", color: "#a78bfa" }}
          variant="secondary"
        >
          {contracts.length} total
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#a78bfa]" />
            <p className="text-muted-foreground text-sm">
              Loading upload history...
            </p>
          </div>
        </div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 font-semibold text-xl">
              No contracts uploaded yet
            </h2>
            <p className="mb-4 text-muted-foreground">
              Upload your first contract to see it here
            </p>
            <Button asChild className="bg-[#a78bfa] hover:bg-[#9b7fe6]">
              <Link href="/upload">Upload Contract</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {contracts.map((contract) => {
              const catColor = getCategoryColor(contract.category);
              const statusBadge = getStatusBadge(contract.status);

              return (
                <Card
                  className="border-[#1e1e2e] bg-[#111118] p-4 transition-colors hover:bg-[#151520]"
                  key={contract.id}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e1e2e]">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {contract.fileName}
                        </p>
                        <Badge
                          className="font-mono text-xs"
                          style={{
                            background: statusBadge.bg,
                            color: statusBadge.color,
                          }}
                          variant="secondary"
                        >
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
                        <span className="uppercase">{contract.fileType}</span>
                        <span>•</span>
                        <span>{formatBytes(contract.fileSize)}</span>
                        <span>•</span>
                        <span>
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className="font-mono text-xs"
                        style={{
                          background: catColor.bg,
                          color: catColor.color,
                        }}
                        variant="secondary"
                      >
                        {contract.category}
                      </Badge>
                      {contract.contractType && (
                        <Badge
                          className="font-mono text-xs"
                          style={{ background: "#1e1e2e", color: "#a78bfa" }}
                          variant="secondary"
                        >
                          {contract.contractType}
                        </Badge>
                      )}
                      {contract.riskScore !== undefined &&
                        contract.riskScore !== null && (
                          <Badge
                            className={cn(
                              "font-mono text-xs",
                              getRiskBgColor(contract.riskScore),
                              getRiskColor(contract.riskScore)
                            )}
                            variant="secondary"
                          >
                            {contract.riskScore}/100
                          </Badge>
                        )}
                      {contract.status === "COMPLETE" && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/chat?contract=${contract.id}`}>
                            Chat
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default HistoryPage;
