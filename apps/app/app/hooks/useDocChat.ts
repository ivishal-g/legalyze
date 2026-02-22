// hooks/useDocChat.ts
import { useState, useCallback } from 'react'

export function useDocChat(contractId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeChunks, setActiveChunks] = useState<string[]>([])

  const sendMessage = useCallback(async (content: string) => {
    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    const response = await fetch('/api/chat/doc', {
      method: 'POST',
      body: JSON.stringify({
        messages: [...messages, userMsg],
        contractId
      })
    })

    // Stream the response
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let aiContent = ''

    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(l => l.startsWith('data:'))
      
      lines.forEach(line => {
        const data = line.replace('data: ', '')
        if (data === '[DONE]') return
        const { text } = JSON.parse(data)
        aiContent += text
        // Update last message progressively
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: aiContent }
        ])
      })
    }

    setIsLoading(false)
  }, [messages, contractId])

  return { messages, sendMessage, isLoading, activeChunks }
}