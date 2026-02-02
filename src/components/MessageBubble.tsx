import { useState, useEffect, useCallback, useRef } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface MessageBubbleData {
  id: string
  fromAgentId: number
  toAgentId: number
  message: string
  timestamp: number
  duration: number
}

interface MessageBubbleProps {
  message: MessageBubbleData
  agentPositions: Map<number, THREE.Vector3>
  onComplete: (messageId: string) => void
}

function MessageBubble({ message, agentPositions, onComplete }: MessageBubbleProps) {
  const [opacity, setOpacity] = useState(1)
  const [scale, setScale] = useState(0)
  const startTime = message.timestamp
  const duration = message.duration || 3000
  
  const fromPosition = agentPositions.get(message.fromAgentId)
  const toPosition = agentPositions.get(message.toAgentId)
  
  const midpoint = new THREE.Vector3()
  if (fromPosition && toPosition) {
    midpoint.copy(fromPosition).add(toPosition).multiplyScalar(0.5)
    midpoint.y += 0.8
  }
  
  useEffect(() => {
    let scaleProgress = 0
    const scaleInterval = setInterval(() => {
      scaleProgress += 0.1
      if (scaleProgress >= 1) {
        setScale(1)
        clearInterval(scaleInterval)
      } else {
        setScale(easeOutBack(scaleProgress))
      }
    }, 16)
    
    return () => clearInterval(scaleInterval)
  }, [])
  
  useEffect(() => {
    const fadeStart = duration - 500
    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      
      if (elapsed >= duration) {
        onComplete(message.id)
        clearInterval(fadeInterval)
      } else if (elapsed >= fadeStart) {
        const fadeProgress = (elapsed - fadeStart) / (duration - fadeStart)
        setOpacity(1 - fadeProgress)
      }
    }, 16)
    
    return () => clearInterval(fadeInterval)
  }, [startTime, duration, message.id, onComplete])
  
  if (!fromPosition || !toPosition) return null
  
  return (
    <group position={midpoint}>
      <Html
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            opacity: opacity,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: 'rgba(59, 130, 246, 0.95)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              maxWidth: '200px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              {truncateMessage(message.message, 30)}
            </div>
            <div
              style={{
                fontSize: '10px',
                opacity: 0.8,
                textAlign: 'right'
              }}
            >
              → Agent {message.toAgentId}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid rgba(59, 130, 246, 0.95)'
              }}
            />
          </div>
        </div>
      </Html>
    </group>
  )
}

function easeOutBack(x: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength - 3) + '...'
}

interface MessageQueueType {
  messages: Map<string, MessageBubbleData>
  nextId: number
  addMessage: (fromAgentId: number, toAgentId: number, message: string, duration?: number) => string
  removeMessage: (id: string) => void
  getAllMessages: () => MessageBubbleData[]
  cleanup: () => void
}

function createMessageQueue(): MessageQueueType {
  const messages = new Map<string, MessageBubbleData>()
  let nextId = 0
  
  return {
    messages,
    nextId,
    addMessage(fromAgentId, toAgentId, message, duration) {
      const id = `msg-${this.nextId++}`
      this.messages.set(id, {
        id,
        fromAgentId,
        toAgentId,
        message,
        timestamp: Date.now(),
        duration: duration || 3000
      })
      return id
    },
    removeMessage(id: string) {
      this.messages.delete(id)
    },
    getAllMessages() {
      return Array.from(this.messages.values())
    },
    cleanup() {
      const now = Date.now()
      for (const [id, message] of this.messages) {
        if (now - message.timestamp > message.duration) {
          this.messages.delete(id)
        }
      }
    }
  }
}

export function useMessageBubbles() {
  const queueRef = useRef<MessageQueueType>(createMessageQueue())
  const [messageList, setMessageList] = useState<MessageBubbleData[]>([])
  
  const addMessage = useCallback((
    fromAgentId: number,
    toAgentId: number,
    message: string,
    duration?: number
  ) => {
    const id = queueRef.current.addMessage(fromAgentId, toAgentId, message, duration)
    setMessageList(queueRef.current.getAllMessages())
    return id
  }, [])
  
  const removeMessage = useCallback((id: string) => {
    queueRef.current.removeMessage(id)
    setMessageList(queueRef.current.getAllMessages())
  }, [])
  
  const clearAll = useCallback(() => {
    for (const msg of queueRef.current.getAllMessages()) {
      queueRef.current.removeMessage(msg.id)
    }
    setMessageList([])
  }, [])
  
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const before = messageList.length
      queueRef.current.cleanup()
      const afterMessages = queueRef.current.getAllMessages()
      if (before !== afterMessages.length) {
        setMessageList(afterMessages)
      }
    }, 1000)
    
    return () => clearInterval(cleanupInterval)
  }, [messageList.length])
  
  return {
    messages: messageList,
    addMessage,
    removeMessage,
    clearAll
  }
}

interface MessageBubbleSystemProps {
  agentPositions: Map<number, THREE.Vector3>
}

export function MessageBubbleSystem({ agentPositions }: MessageBubbleSystemProps) {
  const { messages, removeMessage } = useMessageBubbles()
  
  return (
    <>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          agentPositions={agentPositions}
          onComplete={removeMessage}
        />
      ))}
    </>
  )
}

export function triggerAgentCommunication(
  addMessage: (fromAgentId: number, toAgentId: number, message: string) => void,
  fromAgent: number,
  toAgent: number,
  action: string,
  context?: string
) {
  const defaultMessages: Record<string, string> = {
    'collaborate': `Agent ${fromAgent} wants to collaborate with Agent ${toAgent}`,
    'share': `Agent ${fromAgent} has information to share`,
    'request': `Agent ${fromAgent} requests assistance from Agent ${toAgent}`,
    'complete': `Agent ${fromAgent} completed a task`
  }
  
  const message = context 
    ? `${fromAgent}: ${context}`
    : defaultMessages[action] || `${fromAgent} is active`
  
  addMessage(fromAgent, toAgent, message)
}

export type { MessageBubbleData, MessageBubbleProps, MessageBubbleSystemProps }
