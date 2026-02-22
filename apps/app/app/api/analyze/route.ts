import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for AI analysis response
const riskFlagSchema = z.object({
    section: z.string().describe("Contract section reference, e.g. '§7.2 Liability'"),
    severity: z.enum(["HIGH", "MEDIUM", "LOW"]).describe("Risk severity level"),
    title: z.string().describe("Short title of the risk, e.g. 'Unlimited Liability Exposure'"),
    description: z.string().describe("Plain-English explanation of the risk"),
    suggestion: z.string().describe("Specific suggested fix or replacement language"),
});

const analysisSchema = z.object({
    contract_type: z.string().describe("Auto-detected contract type, e.g. 'Freelance Agreement', 'NDA', 'SaaS Agreement', 'Employment Contract'"),
    risk_score: z.number().min(0).max(100).describe("Overall risk score from 0 (safe) to 100 (extremely risky)"),
    summary: z.string().describe("2-3 sentence plain-English summary of the contract and its key risks"),
    flags: z.array(riskFlagSchema).describe("Array of identified risk flags"),
    missing_clauses: z.array(z.string()).describe("Array of expected clause names that are missing, e.g. 'GDPR Clause', 'Termination Rights'"),
});

async function parseFile(fileUrl: string, fileType: string): Promise<string> {
    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    if (fileType === "pdf") {
        // Dynamic import for pdf-parse (CommonJS module)
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        return data.text;
    }

    // DOCX
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { contractId } = await request.json();

        if (!contractId) {
            return NextResponse.json(
                { error: "Contract ID is required" },
                { status: 400 }
            );
        }

        // Fetch the contract
        const contract = await database.contract.findUnique({
            where: { id: contractId },
        });

        if (!contract) {
            return NextResponse.json(
                { error: "Contract not found" },
                { status: 404 }
            );
        }

        if (contract.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Update status to PROCESSING
        await database.contract.update({
            where: { id: contractId },
            data: { status: "PROCESSING" },
        });

        // Parse the file
        let parsedText: string;
        try {
            parsedText = await parseFile(contract.fileUrl, contract.fileType);
        } catch (parseError) {
            console.error("File parsing error:", parseError);
            await database.contract.update({
                where: { id: contractId },
                data: { status: "ERROR" },
            });
            return NextResponse.json(
                { error: "Failed to parse file" },
                { status: 500 }
            );
        }

        // Trim text to avoid exceeding token limits (roughly 5000 words)
        const trimmedText = parsedText.slice(0, 25000);

        // Analyze with Gemini
        const { object: analysis } = await generateObject({
            model: google("gemini-2.0-flash"),
            schema: analysisSchema,
            prompt: `You are a senior contract attorney. Analyze the provided contract text and return a structured risk report.

Identify:
1. High-risk clauses (unlimited liability, one-sided IP, unfair termination, non-compete overreach, etc.)
2. Missing standard protections for this contract type
3. Unusual or one-sided language compared to standard contracts of that type

For each flag include: section name, severity (HIGH/MEDIUM/LOW), title, plain-English description, and a specific suggested fix.

Determine the contract type automatically. Calculate a risk score from 0–100 (100 = extremely risky).

CONTRACT TEXT:
${trimmedText}`,
        });

        // Save analysis results to the contract
        await database.contract.update({
            where: { id: contractId },
            data: {
                status: "COMPLETE",
                contractType: analysis.contract_type,
                riskScore: analysis.risk_score,
                summary: analysis.summary,
                analyzedAt: new Date(),
            },
        });

        // Save risk flags
        if (analysis.flags.length > 0) {
            await database.riskFlag.createMany({
                data: analysis.flags.map((flag) => ({
                    contractId,
                    title: flag.title,
                    description: flag.description,
                    section: flag.section,
                    riskLevel: flag.severity,
                    suggestion: flag.suggestion,
                })),
            });
        }

        // Save missing clauses
        if (analysis.missing_clauses.length > 0) {
            await database.missingClause.createMany({
                data: analysis.missing_clauses.map((clauseName) => ({
                    contractId,
                    clauseName,
                })),
            });
        }

        return NextResponse.json({
            success: true,
            contractType: analysis.contract_type,
            riskScore: analysis.risk_score,
            summary: analysis.summary,
            flagCount: analysis.flags.length,
            missingClauseCount: analysis.missing_clauses.length,
        });
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: "Failed to analyze contract" },
            { status: 500 }
        );
    }
}
