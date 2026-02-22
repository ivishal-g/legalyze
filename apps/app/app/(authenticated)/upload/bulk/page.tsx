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
import { useCallback, useRef, useState } from "react";

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
  category?: string;
  uploadedAt: Date;
  errorMessage?: string;
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

const categories = [
  { value: "LEGAL", label: "Legal" },
  { value: "BUSINESS", label: "Business" },
  { value: "EDUCATIONAL", label: "Educational" },
  { value: "ADMINISTRATIVE", label: "Administrative" },
];

const BulkUploadPage = () => {
  const [uploads, setUploads] = useState<Contract[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("LEGAL");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        category: selectedCategory,
        uploadedAt: new Date(),
      };

      setUploads((prev) => [...prev, newContract]);
      uploadFile(file, tempId);
    }
  };

  const uploadFile = useCallback(async (file: File, tempId: string) => {
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
      formData.append("category", selectedCategory);

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
  }, [selectedCategory]);

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  const completedCount = uploads.filter((u) => u.status === "complete").length;
  const processingCount = uploads.filter(
    (u) => u.status === "uploading" || u.status === "processing"
  ).length;
  const errorCount = uploads.filter((u) => u.status === "error").length;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <h1 className="mb-2 font-semibold text-3xl">Bulk Upload</h1>
        <p className="text-muted-foreground">
          Upload multiple contracts at once for batch AI analysis. Select a
          category and drop all your files.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            className={cn(
              "font-mono text-sm",
              selectedCategory === cat.value
                ? "bg-[#a78bfa] text-white hover:bg-[#9b7fe6]"
                : ""
            )}
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            size="sm"
            type="button"
            variant={selectedCategory === cat.value ? "default" : "outline"}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <Card className="border-[#1e1e2e] bg-[#111118]">
        <button
          className={cn(
            "flex min-h-[250px] w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
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
              {isDragging
                ? "Drop all files here"
                : "Drop multiple files or click to browse"}
            </p>
            <p className="text-muted-foreground text-sm">
              PDF or DOCX • Max 10MB each • No limit on number of files
            </p>
          </div>
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

      {uploads.length > 0 && (
        <>
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-xl">
              Batch Queue ({uploads.length} files)
            </h2>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <Badge
                  className="font-mono text-xs"
                  style={{ background: "#00d68f20", color: "#00d68f" }}
                  variant="secondary"
                >
                  ✓ {completedCount} done
                </Badge>
              )}
              {processingCount > 0 && (
                <Badge
                  className="font-mono text-xs"
                  style={{ background: "#a78bfa20", color: "#a78bfa" }}
                  variant="secondary"
                >
                  ⏳ {processingCount} in progress
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge
                  className="font-mono text-xs"
                  style={{ background: "#ff3b5c20", color: "#ff3b5c" }}
                  variant="secondary"
                >
                  ✕ {errorCount} errors
                </Badge>
              )}
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-520px)]">
            <div className="space-y-3">
              {uploads.map((upload) => (
                <Card
                  className="border-[#1e1e2e] bg-[#111118] p-3"
                  key={upload.id}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {upload.fileName}
                        </p>
                        <div className="flex items-center gap-2">
                          {upload.status === "complete" && (
                            <>
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
                              <CheckCircle2 className="h-4 w-4 text-[#00d68f]" />
                            </>
                          )}
                          {upload.status === "uploading" && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#a78bfa]" />
                          )}
                          {upload.status === "processing" && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#f5a623]" />
                          )}
                          {upload.status === "error" && (
                            <AlertCircle className="h-4 w-4 text-[#ff3b5c]" />
                          )}
                          <Button
                            onClick={() => removeUpload(upload.id)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {(upload.status === "uploading" ||
                        upload.status === "processing") && (
                        <Progress
                          className="mt-2 h-1"
                          value={upload.progress}
                        />
                      )}

                      {upload.status === "error" && (
                        <p className="mt-1 text-[#ff3b5c] text-xs">
                          {upload.errorMessage || "Failed"}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default BulkUploadPage;
