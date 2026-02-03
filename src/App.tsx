import { useState } from 'react'
import AgentCanvas from './components/AgentCanvas'
import TaskQueue, { Task } from './components/TaskQueue'
import { usePauseResume } from './components/pauseResume'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

interface AgentData {
  id: number
  position: number[]
  state: string
  nearby_agents?: number[]
  reasoning?: string
}

function App() {
  const [count, setCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'agents' | 'react'>('agents')
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)
  const { paused, toggle } = usePauseResume()

  const [agents, setAgents] = useState<AgentData[]>([
    { id: 1, position: [-2, 0, 0], state: 'communicating', reasoning: 'Chatting with Agent 3' },
    { id: 2, position: [0, 0, 0], state: 'working', reasoning: 'Building features' },
    { id: 3, position: [2, 0, 0], state: 'communicating', reasoning: 'Chatting with Agent 1' },
  ])

  const demoTasks: Task[] = [
    { id: 't1', name: 'Design UI', status: 'pending', assignee: 'Agent 1' },
    { id: 't2', name: 'Implement backend', status: 'in_progress', assignee: 'Agent 2' },
    { id: 't3', name: 'Write tests', status: 'completed', assignee: 'Agent 3' },
  ]

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2">Agent Marketplace Demo</h1>
        <p className="text-muted-foreground text-lg">
          2D Pixel-Art Multi-Agent System Visualization with LangGraph Backend
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'agents' | 'react')} className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 h-auto mb-6">
          <TabsTrigger value="agents">Live Agents</TabsTrigger>
          <TabsTrigger value="react">React Components</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-6 space-y-6">
          <Card className="min-h-[500px] p-0 overflow-hidden">
            <CardHeader className="p-6 flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Multi-Agent Visualization</CardTitle>
                <CardDescription>
                  Real-time agent rendering from LangGraph backend (http://localhost:8000)
                </CardDescription>
              </div>
              <Button onClick={toggle} variant={paused ? 'destructive' : 'default'}>
                {paused ? 'Resume' : 'Pause'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <AgentCanvas
                onAgentClick={(agent) => setSelectedAgent(agent)}
                paused={paused}
                agents={agents}
              />
            </CardContent>
          </Card>

          {selectedAgent && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Details - #{selectedAgent.id}</CardTitle>
                <CardDescription>
                  Current state and position from backend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="font-semibold">State:</span>
                  <span className="font-mono">{selectedAgent.state}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="font-semibold">Position:</span>
                  <span className="font-mono">[{selectedAgent.position.join(', ')}]</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="font-semibold">Nearby Agents:</span>
                  <span className="font-mono">
                    {selectedAgent.nearby_agents?.join(', ') || 'None'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Task Queue</CardTitle>
              <CardDescription>Active tasks assigned to agents</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskQueue tasks={demoTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="react" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>
                Current setup status of the project
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">React:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">TypeScript:</span>
                <span className="text-green-400">✅ Strict Mode</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">Vite:</span>
                <span className="text-green-400">✅ Configured</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">Three.js:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">React Three Fiber:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">LangGraph:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">FastAPI:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">Tailwind CSS:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">shadcn/ui:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">Backend Integration:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Counter Demo</CardTitle>
              <CardDescription>
                Testing React state with shadcn/ui Button components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4 text-4xl font-bold">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setCount((c) => c - 1)}
                >
                  -
                </Button>
                <span>{count}</span>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setCount((c) => c + 1)}
                >
                  +
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
