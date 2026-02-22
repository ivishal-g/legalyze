// lib/chunker.ts
export function chunkDocument(text: string, chunkSize = 500) {
  // Split on section boundaries first
  const sections = text.split(
    /(?=§\d|Section \d|ARTICLE|[A-Z]{3,}\s*\n)/
  )
  
  const chunks: { id: string; text: string; section: string }[] = []
  
  sections.forEach((section, i) => {
    // If section too long, split further by sentences
    if (section.length > chunkSize * 4) {
      const sentences = section.match(/[^.!?]+[.!?]+/g) || [section]
      let current = ''
      sentences.forEach(s => {
        if ((current + s).length > chunkSize * 4) {
          chunks.push({ id: `chunk_${chunks.length+1}`, text: current, section: `§${i+1}` })
          current = s
        } else current += ' ' + s
      })
      if (current) chunks.push({ id: `chunk_${chunks.length+1}`, text: current, section: `§${i+1}` })
    } else {
      chunks.push({ id: `chunk_${i+1}`, text: section, section: `§${i+1}` })
    }
  })
  
  return chunks
}