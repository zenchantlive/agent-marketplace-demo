import { useState } from 'react'
import ThreeScene from './components/ThreeScene'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

function App() {
  const [count, setCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'three' | 'react'>('three')

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2">Agent Marketplace Demo</h1>
        <p className="text-muted-foreground text-lg">
          2D Pixel-Art Multi-Agent System Visualization
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'three' | 'react')} className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 h-auto mb-6">
          <TabsTrigger value="three">Three.js Scene</TabsTrigger>
          <TabsTrigger value="react">React Components</TabsTrigger>
        </TabsList>

        <TabsContent value="three" className="mt-6">
          <Card className="min-h-[500px] p-0 overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle>Three.js Demo Scene</CardTitle>
              <CardDescription>
                Rendering a basic 2D sprite with React Three Fiber
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ThreeScene />
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
                <span className="font-semibold">Tailwind CSS:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold">shadcn/ui:</span>
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
