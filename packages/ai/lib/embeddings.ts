// lib/embeddings.ts
// Use Hugging Face free inference API for embeddings
export async function embedText(texts: string[]): Promise<number[][]> {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
      body: JSON.stringify({ inputs: texts })
    }
  )
  return response.json() // returns array of 384-dim vectors
}

// Cosine similarity search
export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const magA = Math.sqrt(a.reduce((s, ai) => s + ai*ai, 0))
  const magB = Math.sqrt(b.reduce((s, bi) => s + bi*bi, 0))
  return dot / (magA * magB)
}

export function findTopChunks(
  queryEmbedding: number[],
  chunkEmbeddings: { chunk: any; embedding: number[] }[],
  topK = 3
) {
  return chunkEmbeddings
    .map(({ chunk, embedding }) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}