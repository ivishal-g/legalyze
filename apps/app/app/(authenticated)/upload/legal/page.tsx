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

const LegalPage = () => {
  const [uploads, setUploads] = useState<Contract[]>([]);
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecentContracts = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts?category=LEGAL&limit=10");
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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const { files } = e.dataTransfer;
    if (files?.length) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files?.length) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024;

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        continue;
      }
      if (file.size > maxSize) {
        continue;
      }

      const tempId = Math.random().toString(36).substring(7);
      const newContract: Contract = {
        id: tempId,
        fileName: file.name,
        fileType: file.name.split(".").pop() || "unknown",
        size: file.size,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date(),
      };

      setUploads((prev) => [...prev, newContract]);
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

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-[#a78bfa]" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-[#f5a623]" />;
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-[#00d68f]" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-[#ff3b5c]" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Analyzing with AI...";
      case "complete":
        return "Complete";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <h1 className="mb-2 font-semibold text-3xl">Legal Contracts</h1>
        <p className="text-muted-foreground">
          Upload legal agreements, court documents, and law firm contracts for
          AI-powered risk analysis
        </p>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card className="border-[#1e1e2e] bg-[#111118]">
            <button
              className={cn(
                "flex min-h-[300px] w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
                isDragging
                  ? "border-[#a78bfa] bg-[#a78bfa]/5"
                  : "border-[#1e1e2e] bg-[#0a0a0f] hover:border-[#a78bfa]/50 hover:bg-[#111118]"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              type="button"
            >
              <div className="rounded-full bg-[#a78bfa]/10 p-4">
                <Upload className="h-8 w-8 text-[#a78bfa]" />
              </div>
              <div className="text-center">
                <p className="mb-1 font-medium">
                  {isDragging ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-muted-foreground text-sm">
                  or click to browse
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  className="font-mono text-xs"
                  style={{ background: "#1e1e2e", color: "#a78bfa" }}
                  variant="secondary"
                >
                  PDF
                </Badge>
                <Badge
                  className="font-mono text-xs"
                  style={{ background: "#1e1e2e", color: "#a78bfa" }}
                  variant="secondary"
                >
                  DOCX
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                Maximum file size: 10MB
              </p>
              <input
                accept=".pdf,.docx"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                ref={fileInputRef}
                type="file"
              />
            </button>
          </Card>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">Supported Document Types:</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Client Retainer Agreements</li>
              <li>• Litigation Settlement Agreements</li>
              <li>• Court Documents & Pleadings</li>
              <li>• Legal Opinion Letters</li>
              <li>• Confidentiality Agreements</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {uploads.length > 0 && (
            <Card className="border-[#1e1e2e] bg-[#111118] p-4">
              <h3 className="mb-3 font-semibold">Upload Queue</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {uploads.map((upload) => (
                    <div
                      className="rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] p-3"
                      key={upload.id}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {upload.fileName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatBytes(upload.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeUpload(upload.id)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {upload.status !== "complete" &&
                        upload.status !== "error" && (
                          <div className="space-y-2">
                            <Progress className="h-1" value={upload.progress} />
                            <div className="flex items-center gap-2">
                              {getStatusIcon(upload.status)}
                              <span className="text-muted-foreground text-xs">
                                {getStatusText(upload.status)}
                              </span>
                            </div>
                          </div>
                        )}

                      {upload.status === "error" && (
                        <div className="mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-[#ff3b5c]" />
                          <span className="text-[#ff3b5c] text-xs">
                            {upload.errorMessage || "Upload failed"}
                          </span>
                        </div>
                      )}

                      {upload.status === "complete" && (
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#00d68f]" />
                            <Badge
                              className="font-mono text-xs"
                              style={{
                                background: "#1e1e2e",
                                color: "#a78bfa",
                              }}
                              variant="secondary"
                            >
                              {upload.contractType}
                            </Badge>
                          </div>
                          {upload.riskScore !== undefined && (
                            <Badge
                              className={cn(
                                "font-mono text-xs",
                                getRiskBgColor(upload.riskScore),
                                getRiskColor(upload.riskScore)
                              )}
                              variant="secondary"
                            >
                              {upload.riskScore}/100
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}

          <Card className="border-[#1e1e2e] bg-[#111118] p-4">
            <h3 className="mb-3 font-semibold">Recent Legal Uploads</h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {recentContracts.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground text-sm">
                    No legal contracts uploaded yet. Upload your first document
                    to get started.
                  </p>
                ) : (
                  recentContracts.map((contract) => (
                    <div
                      className="rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] p-3 transition-colors hover:bg-[#111118]"
                      key={contract.id}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {contract.fileName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatBytes(contract.size)} •{" "}
                              {contract.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          className="font-mono text-xs"
                          style={{ background: "#1e1e2e", color: "#a78bfa" }}
                          variant="secondary"
                        >
                          {contract.contractType || "Processing..."}
                        </Badge>
                        {contract.riskScore !== undefined && (
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
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          View Report
                        </Button>
                        <Button
                          className="flex-1"
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
