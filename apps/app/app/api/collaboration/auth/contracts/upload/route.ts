import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { put } from "@repo/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // 2. Create contract record in database
    const contract = await database.contract.create({
      data: {
        fileName: file.name,
        fileType: file.name.split(".").pop() || "unknown",
        fileSize: file.size,
        fileUrl: blob.url,
        category: category as any,
        status: "PROCESSING",
        userId: session.userId,
        organizationId: session.orgId || null,
      },
    });

    // 3. Trigger AI analysis (async - can use a queue)
    // You can call your AI service here or use a background job
    // await analyzeContract(contract.id, blob.url);

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        fileName: contract.fileName,
        fileUrl: contract.fileUrl,
        status: contract.status,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}