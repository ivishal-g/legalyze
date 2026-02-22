import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { userId, orgId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
        const status = searchParams.get("status");

        // Build where clause
        const where: Record<string, unknown> = { userId };

        if (category) {
            where.category = category.toUpperCase();
        }

        if (status) {
            where.status = status.toUpperCase();
        }

        if (orgId) {
            where.organizationId = orgId;
        }

        const contracts = await database.contract.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                riskFlags: {
                    select: {
                        id: true,
                        title: true,
                        riskLevel: true,
                        section: true,
                    },
                },
                _count: {
                    select: {
                        chatMessages: true,
                        riskFlags: true,
                    },
                },
            },
        });

        return NextResponse.json({ contracts });
    } catch (error) {
        console.error("Fetch contracts error:", error);
        return NextResponse.json(
            { error: "Failed to fetch contracts" },
            { status: 500 }
        );
    }
}
