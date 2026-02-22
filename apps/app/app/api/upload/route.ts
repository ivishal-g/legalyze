import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Check for required Vercel Blob token
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error("Missing BLOB_READ_WRITE_TOKEN environment variable");
            return NextResponse.json(
                { error: "Server misconfiguration: Blob storage token is missing." },
                { status: 500 }
            );
        }

        const { userId, orgId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const category = (formData.get("category") as string) || "LEGAL";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const validExtensions = [".pdf", ".docx"];
        const hasValidExtension = validExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
            return NextResponse.json(
                { error: "Invalid file type. Only PDF and DOCX are supported." },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB." },
                { status: 400 }
            );
        }

        // Determine file type
        const fileType = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";

        // Upload to Vercel Blob
        const blob = await put(`contracts/${userId}/${Date.now()}_${file.name}`, file, {
            access: "public",
        });

        // Validate category
        const validCategories = ["ADMINISTRATIVE", "EDUCATIONAL", "LEGAL", "BUSINESS"];
        const normalizedCategory = validCategories.includes(category.toUpperCase())
            ? category.toUpperCase()
            : "LEGAL";

        // Create contract record in database
        const contract = await database.contract.create({
            data: {
                fileName: file.name,
                fileType,
                fileSize: file.size,
                fileUrl: blob.url,
                category: normalizedCategory as "ADMINISTRATIVE" | "EDUCATIONAL" | "LEGAL" | "BUSINESS",
                status: "UPLOADING",
                userId,
                organizationId: orgId,
            },
        });

        return NextResponse.json({
            id: contract.id,
            url: blob.url,
            fileName: contract.fileName,
            status: contract.status,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Upload error:", message, error);
        return NextResponse.json(
            { error: `Failed to upload file: ${message}` },
            { status: 500 }
        );
    }
}

