import { useState, useEffect, useCallback } from 'react'

interface Agent {
  id: number
  position: number[]
  state: string
  nearby_agents?: number[]
  reasoning?: string
}

interface AgentDecisionResponse {
  agent_id: number
  action: string
  reasoning: string
  observations: string[]
}

interface UseAgentBackendReturn {
  agents: Agent[]
  isLoading: boolean
  error: string | null
  getAgentDecision: (agentId: number, position: number[], nearbyAgents: number[]) => Promise<AgentDecisionResponse>
  refreshAgents: () => Promise<void>
}

export function useAgentBackend(baseUrl: string = 'http://localhost:8000'): UseAgentBackendReturn {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`${baseUrl}/api/agents`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }
      
      const data = await response.json()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching agents:', err)
    } finally {
      setIsLoading(false)
    }
  }, [baseUrl])

  const getAgentDecision = useCallback(async (
    agentId: number,
    position: number[],
    nearbyAgents: number[]
  ): Promise<AgentDecisionResponse> => {
    try {
      const response = await fetch(`${baseUrl}/api/agents/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
          position,
          nearby_agents: nearbyAgents
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to get agent decision: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error getting agent decision:', err)
      throw err
    }
  }, [baseUrl])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return {
    agents,
    isLoading,
    error,
    getAgentDecision,
    refreshAgents: fetchAgents
  }
}
