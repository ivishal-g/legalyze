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
import { useRef, useState } from "react";

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
};

const recentContracts: Contract[] = [
  {
    id: "1",
    fileName: "student_enrollment_agreement.pdf",
    fileType: "pdf",
    size: 1_800_000,
    status: "complete",
    progress: 100,
    contractType: "Enrollment Agreement",
    riskScore: 38,
    uploadedAt: new Date(Date.now() - 4_800_000),
  },
  {
    id: "2",
    fileName: "faculty_employment_contract.pdf",
    fileType: "pdf",
    size: 2_900_000,
    status: "complete",
    progress: 100,
    contractType: "Employment Contract",
    riskScore: 52,
    uploadedAt: new Date(Date.now() - 9_600_000),
  },
];

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

const EducationalPage = () => {
  const [uploads, setUploads] = useState<Contract[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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
        console.error(
          `${file.name} is not a supported file type. Please upload PDF or DOCX files.`
        );
        continue;
      }

      if (file.size > maxSize) {
        console.error(`${file.name} exceeds 10MB limit.`);
        continue;
      }

      const newContract: Contract = {
        id: Math.random().toString(36).substring(7),
        fileName: file.name,
        fileType: file.name.split(".").pop() || "unknown",
        size: file.size,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date(),
      };

      setUploads((prev) => [...prev, newContract]);

      simulateUpload(newContract.id);
    }
  };

  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      if (progress >= 100) {
        clearInterval(interval);
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === id
              ? {
                  ...upload,
                  status: "processing",
                  progress: 100,
                }
              : upload
          )
        );

        setTimeout(() => {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === id
                ? {
                    ...upload,
                    status: "complete",
                    contractType: "Educational Document",
                    riskScore: Math.floor(Math.random() * (85 - 25 + 1)) + 25,
                  }
                : upload
            )
          );
        }, 2000);
      } else {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === id ? { ...upload, progress } : upload
          )
        );
      }
    }, 200);
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
        return "Analyzing...";
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
        <h1 className="mb-2 font-semibold text-3xl">Educational Contracts</h1>
        <p className="text-muted-foreground">
          Upload educational agreements, enrollment contracts, and academic
          documents for AI-powered risk analysis
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
              <li>• Student Enrollment Agreements</li>
              <li>• Faculty Employment Contracts</li>
              <li>• Research Collaboration Agreements</li>
              <li>• Academic Partnership MOUs</li>
              <li>• Tuition & Fee Agreements</li>
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

                      {upload.status !== "complete" && (
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
            <h3 className="mb-3 font-semibold">Recent Educational Uploads</h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {recentContracts.map((contract) => (
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
                        {contract.contractType}
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
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EducationalPage;
