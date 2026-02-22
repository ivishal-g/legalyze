// app/api/chat/doc/route.ts
import Groq from 'groq-sdk'
import { embedText, findTopChunks } from '@/lib/embeddings'
import { prisma } from '@/lib/prisma'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { messages, contractId } = await req.json()
  const userQuery = messages[messages.length - 1].content

  // 1. Get stored chunks + embeddings from DB
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { chunks: true }
  })

  if (!contract) {
    return new Response(JSON.stringify({ error: 'Contract not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 2. Embed the user's question
  const [queryEmbedding] = await embedText([userQuery])

  // 3. Find top-3 most relevant chunks
  const topChunks = findTopChunks(
    queryEmbedding,
    contract.chunks.map(c => ({
      chunk: c,
      embedding: JSON.parse(c.embedding)
    }))
  )

  const context = topChunks
    .map((r, i) => `[CHUNK ${i+1} - ${r.chunk.section} - Relevance: ${r.score.toFixed(2)}]\n${r.chunk.text}`)
    .join('\n\n---\n\n')

  // 4. Stream from Groq
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    max_tokens: 1024,
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are Legalyze AI, a legal contract analyst. 
Answer questions about this contract using ONLY the context chunks provided.
Always cite which section (§) your answer comes from.
Flag risks clearly using: 🔴 HIGH RISK, 🟡 MEDIUM RISK, ✅ SAFE.
Never make up clauses not present in the context.
Be concise, plain English, non-lawyer friendly.

CONTRACT CONTEXT:
${context}`
      },
      ...messages
    ]
  })

  // 5. Return as ReadableStream (works with useChat hook)
  const encoder = new TextEncoder()
  let fullResponse = ''
  
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()

        // Save to DB after stream completes
        await prisma.message.createMany({
          data: [
            { contractId, role: 'user', content: userQuery },
            { 
              contractId, 
              role: 'assistant', 
              content: fullResponse,
              chunksUsed: topChunks.map(r => r.chunk.id) 
            }
          ]
        })
      } catch (error) {
        console.error('Streaming error:', error)
        controller.error(error)
      }
    }
  })

  return new Response(readable, {
    headers: { 
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}