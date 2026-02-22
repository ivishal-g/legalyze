"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Card } from "@repo/design-system/components/ui/card";
import { Progress } from "@repo/design-system/components/ui/progress";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { cn } from "@repo/design-system/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "error";

type Contract = {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  status: UploadStatus;
  progress: number;
  contractType?: string;
  riskScore?: number;
  uploadedAt: Date;
  errorMessage?: string;
};

type DBContract = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  contractType?: string;
  riskScore?: number;
  createdAt: string;
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

const UploadPage = () => {
  const [uploads, setUploads] = useState<Contract[]>([]);
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecentContracts = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts?limit=10");
      if (res.ok) {
        const data = await res.json();
        const contracts: Contract[] = data.contracts.map((c: DBContract) => ({
          id: c.id,
          fileName: c.fileName,
          fileType: c.fileType,
          size: c.fileSize,
          status: c.status.toLowerCase() as UploadStatus,
          progress: 100,
          contractType: c.contractType,
          riskScore: c.riskScore ?? undefined,
          uploadedAt: new Date(c.createdAt),
        }));
        setRecentContracts(contracts);
      }
    } catch (error) {
      console.error("Failed to fetch recent contracts:", error);
    }
  }, []);

  useEffect(() => {
    fetchRecentContracts();
  }, [fetchRecentContracts]);

  const processFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }

    for (const file of Array.from(files)) {
      const validExtensions = [".pdf", ".docx"];
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.endsWith(ext)
      );

      if (!hasValidExtension || file.size > 10_485_760) {
        continue;
      }

      const tempId = Math.random().toString(36).substring(7);
      const newContract: Contract = {
        id: tempId,
        fileName: file.name,
        fileType: file.name.endsWith(".pdf") ? "pdf" : "docx",
        size: file.size,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date(),
      };

      setUploads((prev) => [newContract, ...prev]);
      uploadFile(file, tempId);
    }
  };

  const uploadFile = async (file: File, tempId: string) => {
    try {
      const progressInterval = setInterval(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === tempId
              ? { ...u, progress: Math.min(u.progress + 15, 90) }
              : u
          )
        );
      }, 300);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "LEGAL");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }

      const { id: contractId } = await uploadRes.json();

      setUploads((prev) =>
        prev.map((u) =>
          u.id === tempId
            ? { ...u, id: contractId, progress: 100, status: "processing" }
            : u
        )
      );

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "Analysis failed");
      }

      const analysis = await analyzeRes.json();

      setUploads((prev) =>
        prev.map((u) =>
          u.id === contractId
            ? {
                ...u,
                status: "complete",
                contractType: analysis.contractType,
                riskScore: analysis.riskScore,
              }
            : u
        )
      );

      fetchRecentContracts();
    } catch (error) {
      console.error("Upload/analysis error:", error);
      setUploads((prev) =>
        prev.map((u) =>
          u.id === tempId
            ? {
                ...u,
                status: "error",
                progress: 0,
                errorMessage:
                  error instanceof Error ? error.message : "Upload failed",
              }
            : u
        )
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((c) => c.id !== id));
  };

  const allContracts = [...uploads, ...recentContracts];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Upload Contract</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Upload PDF or DOCX files for AI-powered risk analysis
          </p>
        </div>
        <Badge
          className="font-mono text-xs"
          style={{ background: "#a78bfa20", color: "#a78bfa" }}
          variant="secondary"
        >
          Max 10MB
        </Badge>
      </div>

      <Card className="border-[#1e1e2e] bg-[#111118] p-8">
        <button
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 transition-colors",
            isDragActive
              ? "border-[#a78bfa] bg-[#a78bfa]/5"
              : "border-[#1e1e2e] bg-[#0a0a0f]"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          type="button"
        >
          <input
            accept=".pdf,.docx"
            className="hidden"
            multiple
            onChange={handleFileInputChange}
            ref={fileInputRef}
            type="file"
          />
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
              isDragActive ? "bg-[#a78bfa]/20" : "bg-[#1e1e2e]"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragActive ? "text-[#a78bfa]" : "text-muted-foreground"
              )}
            />
          </div>
          <h3 className="mb-2 font-semibold text-lg">
            {isDragActive ? "Drop files here" : "Drop files or click to upload"}
          </h3>
          <p className="mb-4 text-muted-foreground text-sm">
            PDF or DOCX up to 10MB
          </p>
          <span className="inline-flex items-center gap-2 rounded-lg bg-[#a78bfa] px-6 py-3 font-semibold text-sm transition-colors hover:bg-[#9b7fe6]">
            <Upload className="h-4 w-4" />
            Browse Files
          </span>
        </button>
      </Card>

      {allContracts.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">
              {uploads.length > 0 ? "Upload Queue" : "Recent Uploads"}
            </h2>
            <span className="font-mono text-muted-foreground text-sm">
              {allContracts.length} contract
              {allContracts.length !== 1 ? "s" : ""}
            </span>
          </div>

          <ScrollArea className="h-[calc(100vh-440px)]">
            <div className="flex flex-col gap-3">
              {allContracts.map((contract) => (
                <Card
                  className="border-[#1e1e2e] bg-[#111118] p-4"
                  key={contract.id}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1e1e2e]">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm">
                              {contract.fileName}
                            </h3>
                            {contract.status === "complete" && (
                              <CheckCircle2 className="h-4 w-4 text-[#00d68f]" />
                            )}
                            {contract.status === "error" && (
                              <AlertCircle className="h-4 w-4 text-[#ff3b5c]" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <span className="uppercase">
                              {contract.fileType}
                            </span>
                            <span>•</span>
                            <span>{formatBytes(contract.size)}</span>
                            {contract.contractType ? (
                              <>
                                <span>•</span>
                                <span>{contract.contractType}</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {contract.status === "complete" &&
                            contract.riskScore !== undefined && (
                              <Badge
                                className={cn(
                                  "font-mono text-xs",
                                  getRiskBgColor(contract.riskScore),
                                  getRiskColor(contract.riskScore)
                                )}
                                variant="secondary"
                              >
                                Risk: {contract.riskScore}/100
                              </Badge>
                            )}
                          {contract.status === "uploading" && (
                            <Badge
                              className="font-mono text-xs"
                              style={{
                                background: "#a78bfa20",
                                color: "#a78bfa",
                              }}
                              variant="secondary"
                            >
                              Uploading...
                            </Badge>
                          )}
                          {contract.status === "processing" && (
                            <Badge
                              className="gap-1 font-mono text-xs"
                              style={{
                                background: "#a78bfa20",
                                color: "#a78bfa",
                              }}
                              variant="secondary"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Analyzing...
                            </Badge>
                          )}
                          {contract.status === "error" && (
                            <Badge
                              className="font-mono text-xs"
                              style={{
                                background: "#ff3b5c20",
                                color: "#ff3b5c",
                              }}
                              variant="secondary"
                            >
                              Error
                            </Badge>
                          )}
                          <Button
                            onClick={() => removeUpload(contract.id)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {(contract.status === "uploading" ||
                        contract.status === "processing") && (
                        <Progress className="h-1" value={contract.progress} />
                      )}

                      {contract.status === "complete" && (
                        <div className="flex gap-2">
                          <Button
                            className="h-8 text-xs"
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            View Report
                          </Button>
                          <Button
                            className="h-8 text-xs"
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            Ask Questions
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
