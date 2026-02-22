import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { messages, contractId } = await request.json();

        if (!contractId) {
            return new Response("Contract ID is required", { status: 400 });
        }

        // Fetch the contract with its analysis
        const contract = await database.contract.findUnique({
            where: { id: contractId },
            include: {
                riskFlags: true,
            },
        });

        if (!contract) {
            return new Response("Contract not found", { status: 404 });
        }

        if (contract.userId !== userId) {
            return new Response("Unauthorized", { status: 403 });
        }

        // Save the latest user message to the database
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "user") {
            await database.chatMessage.create({
                data: {
                    contractId,
                    role: "user",
                    content: lastMessage.content,
                },
            });
        }

        // Build context from contract analysis
        const riskFlagsSummary = contract.riskFlags
            .map(
                (flag) =>
                    `- [${flag.riskLevel}] ${flag.title} (${flag.section}): ${flag.description}`
            )
            .join("\n");

        const systemPrompt = `You are a contract analysis assistant for Legalyze AI. The user has uploaded the following contract:

FILE: ${contract.fileName}
TYPE: ${contract.contractType || "Unknown"}
RISK SCORE: ${contract.riskScore ?? "Not yet analyzed"}/100
SUMMARY: ${contract.summary || "No summary available"}

IDENTIFIED RISK FLAGS:
${riskFlagsSummary || "No risk flags identified yet."}

Answer the user's questions accurately based on the contract analysis above. Be concise, use plain English, and be helpful. When suggesting improvements, provide specific replacement language. If you don't have enough context to answer precisely, say so clearly.`;

        // Stream response from Gemini
        const result = streamText({
            model: google("gemini-2.0-flash"),
            system: systemPrompt,
            messages,
            onFinish: async ({ text }) => {
                // Save assistant response to database
                await database.chatMessage.create({
                    data: {
                        contractId,
                        role: "assistant",
                        content: text,
                    },
                });
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error("Chat error:", error);
        return new Response("Failed to process chat", { status: 500 });
    }
}
