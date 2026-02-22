"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Card } from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRef, useState } from "react";

interface ApiResponse {
  success: boolean;
  contractType?: string;
  riskScore?: number;
  analysis?: any;
  error?: string;
  timestamp?: string;
}

const Upload3Page = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setUploadStatus("error");
      setApiResponse({ success: false, error: "Only PDF files are supported" });
      return;
    }

    if (file.size > 10_485_760) {
      setUploadStatus("error");
      setApiResponse({ success: false, error: "File size must be less than 10MB" });
      return;
    }

    setUploadStatus("uploading");
    setIsDisabled(true);
    setApiResponse(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3002/api/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setUploadStatus("success");
      setApiResponse(result);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setApiResponse({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const resetUpload = () => {
    setUploadStatus("idle");
    setApiResponse(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Simple API Test</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Test PDF upload to n8n API
          </p>
        </div>
      </div>

      <Card className="border-[#1e1e2e] bg-[#111118] p-8">
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 transition-colors",
            isDragActive && !isDisabled
              ? "border-[#a78bfa] bg-[#a78bfa]/5"
              : isDisabled
              ? "border-[#374151] bg-[#1a1a1f] cursor-not-allowed"
              : "border-[#1e1e2e] bg-[#0a0a0f] cursor-pointer"
          )}
          onClick={() => !isDisabled && fileInputRef.current?.click()}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            accept=".pdf"
            className="hidden"
            disabled={isDisabled}
            onChange={handleFileInputChange}
            ref={fileInputRef}
            type="file"
          />
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
              isDragActive && !isDisabled
                ? "bg-[#a78bfa]/20"
                : isDisabled
                ? "bg-[#374151]"
                : "bg-[#1e1e2e]"
            )}
          >
            {uploadStatus === "uploading" ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#a78bfa]" />
            ) : uploadStatus === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-[#00d68f]" />
            ) : uploadStatus === "error" ? (
              <AlertCircle className="h-8 w-8 text-[#ff3b5c]" />
            ) : (
              <Upload
                className={cn(
                  "h-8 w-8 transition-colors",
                  isDragActive && !isDisabled
                    ? "text-[#a78bfa]"
                    : isDisabled
                    ? "text-[#6b7280]"
                    : "text-muted-foreground"
                )}
              />
            )}
          </div>
          <h3 className="mb-2 font-semibold text-lg">
            {uploadStatus === "uploading"
              ? "Processing PDF..."
              : uploadStatus === "success"
              ? "Upload Complete!"
              : uploadStatus === "error"
              ? "Upload Failed"
              : isDragActive
              ? "Drop PDF here"
              : "Drop PDF or click to upload"}
          </h3>
          <p className="mb-4 text-muted-foreground text-sm">
            {uploadStatus === "uploading"
              ? "Sending to n8n for analysis..."
              : uploadStatus === "success"
              ? "PDF successfully processed"
              : uploadStatus === "error"
              ? apiResponse?.error || "Something went wrong"
              : "PDF files only, up to 10MB"}
          </p>
          {!isDisabled && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#a78bfa] px-6 py-3 font-semibold text-sm transition-colors hover:bg-[#9b7fe6] cursor-pointer">
              <Upload className="h-4 w-4" />
              {uploadStatus === "success" ? "Upload Another" : "Browse Files"}
            </span>
          )}
        </div>
      </Card>

      {/* API Response Display */}
      {apiResponse && (
        <Card className="border-[#1e1e2e] bg-[#111118] p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1e1e2e]">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-4">
              {apiResponse.success && apiResponse.analysis ? (
                <>
                  {/* Risk Assessment */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">n8n Analysis Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-[#1e1e2e] p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
                        <div className={`text-2xl font-bold capitalize ${
                          apiResponse.analysis.overall_risk ? (
                            apiResponse.analysis.overall_risk === "High" ? "text-red-500" :
                            apiResponse.analysis.overall_risk === "Medium" ? "text-yellow-500" :
                            "text-green-500"
                          ) : (
                            // Calculate from clauses if no overall_risk
                            apiResponse.analysis.clauses?.some((c: any) => c.risk_level === "High") ? "text-red-500" :
                            apiResponse.analysis.clauses?.some((c: any) => c.risk_level === "Medium") ? "text-yellow-500" :
                            "text-green-500"
                          )
                        }`}>
                          {apiResponse.analysis.overall_risk ||
                           (apiResponse.analysis.clauses?.some((c: any) => c.risk_level === "High") ? "High" :
                            apiResponse.analysis.clauses?.some((c: any) => c.risk_level === "Medium") ? "Medium" : "Low")}
                        </div>
                      </div>
                      <div className="bg-[#1e1e2e] p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total Clauses</div>
                        <div className="text-2xl font-bold">
                          {apiResponse.analysis.clauses?.length || 0}
                        </div>
                      </div>
                      <div className="bg-[#1e1e2e] p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                        <div className="text-2xl font-bold">
                          {apiResponse.riskScore ||
                           (apiResponse.analysis.clauses?.some((c: any) => c.risk_level === "High") ? 80 :
                            apiResponse.analysis.clauses?.some((c: any) => c.risk_level === "Medium") ? 50 : 20)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {apiResponse.analysis.summary && (
                    <div>
                      <h4 className="font-semibold text-md mb-2">Summary</h4>
                      <p className="text-muted-foreground">{apiResponse.analysis.summary}</p>
                    </div>
                  )}

                  {/* Document Summary */}
                  {apiResponse.analysis.document_summary && (
                    <div>
                      <h4 className="font-semibold text-md mb-3">Document Summary</h4>
                      <div className="bg-[#1e1e2e] p-4 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Document Type</div>
                            <div className="font-medium">{apiResponse.analysis.document_summary.title}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Clauses</div>
                            <div className="font-medium">{apiResponse.analysis.document_summary.total_clauses}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Risk Level</div>
                            <div className={`font-medium capitalize ${
                              apiResponse.analysis.document_summary.overall_risk === "High" ? "text-red-500" :
                              apiResponse.analysis.document_summary.overall_risk === "Medium" ? "text-yellow-500" :
                              "text-green-500"
                            }`}>
                              {apiResponse.analysis.document_summary.overall_risk}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Risk Score</div>
                            <div className="font-medium">{apiResponse.analysis.document_summary.risk_score}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Breakdown */}
                  {apiResponse.analysis.risk_breakdown && (
                    <div>
                      <h4 className="font-semibold text-md mb-3">Risk Breakdown</h4>
                      <div className="bg-[#1e1e2e] p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-500">{apiResponse.analysis.risk_breakdown.high_risk}</div>
                            <div className="text-sm text-muted-foreground">High Risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-500">{apiResponse.analysis.risk_breakdown.medium_risk}</div>
                            <div className="text-sm text-muted-foreground">Medium Risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-500">{apiResponse.analysis.risk_breakdown.low_risk}</div>
                            <div className="text-sm text-muted-foreground">Low Risk</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Categorized Clauses */}
                  {apiResponse.analysis.categorized_clauses && (
                    <div>
                      <h4 className="font-semibold text-md mb-3">Categorized Clauses</h4>
                      <div className="space-y-4">
                        {Object.entries(apiResponse.analysis.categorized_clauses).map(([category, clauses]: [string, any]) => (
                          <div key={category} className="bg-[#1e1e2e] p-4 rounded-lg">
                            <h5 className="font-medium mb-3 capitalize flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#a78bfa] rounded-full" />
                              {category.replace(/_/g, " ")} ({clauses.length})
                            </h5>
                            <div className="space-y-2">
                              {clauses.map((clause: any, index: number) => (
                                <div key={index} className="bg-[#0a0a0f] p-3 rounded border border-[#1e1e2e]">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="text-sm font-medium">Clause {clause.index}</div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                                      clause.risk_level === "High" ? "bg-red-500/20 text-red-500" :
                                      clause.risk_level === "Medium" ? "bg-yellow-500/20 text-yellow-500" :
                                      "bg-green-500/20 text-green-500"
                                    }`}>
                                      {clause.risk_level}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-1 whitespace-pre-wrap">{clause.text}</div>
                                  <div className="text-xs text-muted-foreground italic">{clause.risk_reason}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Insights */}
                  {apiResponse.analysis.key_insights && apiResponse.analysis.key_insights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-md mb-3">Key Insights</h4>
                      <div className="bg-[#1e1e2e] p-4 rounded-lg">
                        <div className="space-y-2">
                          {apiResponse.analysis.key_insights.map((insight: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-[#a78bfa] rounded-full mt-2 shrink-0" />
                              <div className="text-sm">{insight}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback for old format */}
                  {!apiResponse.analysis.document_summary && apiResponse.analysis.clauses && apiResponse.analysis.clauses.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-md mb-3">Contract Clauses Analysis</h4>

                      {/* Categorized Clauses */}
                      <div className="space-y-6">
                        {/* High Risk Clauses */}
                        {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "High").length > 0 && (
                          <div>
                            <h5 className="text-red-500 font-medium mb-3 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              High Risk Clauses ({apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "High").length})
                            </h5>
                            <div className="space-y-3">
                              {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "High").map((clause: any, index: number) => (
                                <div key={index} className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">Clause {clause.index}</div>
                                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-500/20 text-red-500">
                                      HIGH RISK
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{clause.text}</div>
                                  <div className="text-xs text-red-400 italic">{clause.risk_reason}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Medium Risk Clauses */}
                        {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Medium").length > 0 && (
                          <div>
                            <h5 className="text-yellow-500 font-medium mb-3 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Medium Risk Clauses ({apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Medium").length})
                            </h5>
                            <div className="space-y-3">
                              {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Medium").map((clause: any, index: number) => (
                                <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">Clause {clause.index}</div>
                                    <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-500/20 text-yellow-500">
                                      MEDIUM RISK
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{clause.text}</div>
                                  <div className="text-xs text-yellow-400 italic">{clause.risk_reason}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Low Risk Clauses */}
                        {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Low").length > 0 && (
                          <div>
                            <h5 className="text-green-500 font-medium mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Low Risk Clauses ({apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Low").length})
                            </h5>
                            <div className="space-y-3">
                              {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Low").map((clause: any, index: number) => (
                                <div key={index} className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">Clause {clause.index}</div>
                                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-500">
                                      LOW RISK
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{clause.text}</div>
                                  <div className="text-xs text-green-400 italic">{clause.risk_reason}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary Statistics */}
                      <div className="mt-6 p-4 bg-[#1e1e2e] rounded-lg">
                        <h5 className="font-medium mb-3">Risk Summary</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-red-500">
                              {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "High").length}
                            </div>
                            <div className="text-xs text-muted-foreground">High Risk</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-500">
                              {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Medium").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Medium Risk</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-500">
                              {apiResponse.analysis.clauses.filter((c: any) => c.risk_level === "Low").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Low Risk</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {apiResponse.analysis.recommendations && apiResponse.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-md mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {apiResponse.analysis.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-[#a78bfa] rounded-full mt-2 shrink-0" />
                            <div className="text-sm">{rec}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw JSON Toggle */}
                  <div>
                    <details className="cursor-pointer">
                      <summary className="text-sm text-muted-foreground hover:text-foreground">
                        View Raw API Response
                      </summary>
                      <div className="bg-[#1e1e2e] p-4 rounded-lg mt-2">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(apiResponse, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                </>
              ) : (
                <div>
                  <h3 className="font-semibold text-lg mb-2">API Response</h3>
                  <div className="bg-[#1e1e2e] p-4 rounded-lg">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={resetUpload} variant="outline">
                  Upload New PDF
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Upload3Page;
