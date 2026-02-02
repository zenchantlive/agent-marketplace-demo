"""
OpenClaw Integration Module

Connects the agent visualization to the OpenClaw Gateway for real-time
multi-agent system data retrieval and display.

This module provides:
- OpenClaw Gateway connection management
- Session/agent data fetching
- Agent state mapping between OpenClaw and our visualization
"""

import asyncio
import json
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from enum import Enum
import httpx
from pydantic import BaseModel


class OpenClawAgentState(str, Enum):
    """OpenClaw agent states mapped to visualization states"""
    IDLE = "idle"
    WORKING = "working"
    THINKING = "reasoning"
    COMMUNICATING = "communicating"
    ERROR = "error"


@dataclass
class OpenClawAgent:
    """Represents an agent from OpenClaw"""
    id: str
    name: str
    state: str
    position: List[float] = field(default_factory=lambda: [0.0, 0.0])
    model: str = ""
    channel: str = ""
    reasoning: Optional[str] = None
    nearby_agents: List[str] = field(default_factory=list)
    last_updated: float = 0.0


@dataclass
class OpenClawSession:
    """Represents a session from OpenClaw"""
    id: str
    key: str
    kind: str
    model: str
    updated_at: float
    agents: List[OpenClawAgent] = field(default_factory=list)


class OpenClawGatewayClient:
    """
    Client for connecting to OpenClaw Gateway WebSocket/HTTP API.
    
    Usage:
        client = OpenClawGatewayClient()
        await client.connect()
        agents = await client.get_active_agents()
        await client.disconnect()
    """
    
    def __init__(
        self,
        gateway_url: str = "http://localhost:18789",
        api_key: Optional[str] = None,
        timeout: float = 10.0
    ):
        self.gateway_url = gateway_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self._http_client: Optional[httpx.AsyncClient] = None
        self._connected = False
        
    async def connect(self) -> bool:
        """Establish connection to OpenClaw Gateway"""
        try:
            self._http_client = httpx.AsyncClient(
                timeout=self.timeout,
                headers=self._get_headers()
            )
            
            # Test connection
            health = await self._http_client.get(f"{self.gateway_url}/health")
            health.raise_for_status()
            
            self._connected = True
            return True
            
        except Exception as e:
            print(f"Failed to connect to OpenClaw Gateway: {e}")
            self._connected = False
            return False
    
    async def disconnect(self):
        """Close connection to OpenClaw Gateway"""
        if self._http_client:
            await self._http_client.aclose()
            self._http_client = None
            self._connected = False
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers
    
    @property
    def is_connected(self) -> bool:
        """Check if connected to Gateway"""
        return self._connected and self._http_client is not None
    
    async def get_health(self) -> Dict[str, Any]:
        """Get Gateway health status"""
        if not self.is_connected:
            raise RuntimeError("Not connected to OpenClaw Gateway")
        
        response = await self._http_client.get(f"{self.gateway_url}/health")
        response.raise_for_status()
        return response.json()
    
    async def get_sessions(self) -> List[OpenClawSession]:
        """
        Fetch all active sessions from the Gateway.
        
        Returns a list of sessions, each containing agent information.
        """
        if not self.is_connected:
            raise RuntimeError("Not connected to OpenClaw Gateway")
        
        try:
            response = await self._http_client.get(f"{self.gateway_url}/api/v1/sessions")
            response.raise_for_status()
            data = response.json()
            
            sessions = []
            for session_data in data.get("sessions", []):
                session = OpenClawSession(
                    id=session_data.get("id", ""),
                    key=session_data.get("key", ""),
                    kind=session_data.get("kind", "unknown"),
                    model=session_data.get("model", ""),
                    updated_at=session_data.get("updated_at", 0)
                )
                sessions.append(session)
            
            return sessions
            
        except httpx.HTTPStatusError as e:
            print(f"Failed to get sessions: {e}")
            return []
    
    async def get_active_agents(self) -> List[OpenClawAgent]:
        """
        Get all active agents from all sessions.
        
        Returns a flat list of agents suitable for visualization.
        """
        if not self.is_connected:
            raise RuntimeError("Not connected to OpenClaw Gateway")
        
        sessions = await self.get_sessions()
        agents = []
        
        for session in sessions:
            for i, agent in enumerate(session.agents):
                agents.append(agent)
        
        return agents
    
    async def get_session_agents(self, session_key: str) -> List[OpenClawAgent]:
        """Get agents for a specific session"""
        sessions = await self.get_sessions()
        for session in sessions:
            if session.key == session_key:
                return session.agents
        return []
    
    def map_agent_to_visualization(self, agent: OpenClawAgent) -> Dict[str, Any]:
        """
        Map an OpenClaw agent to visualization format.
        
        Args:
            agent: The OpenClaw agent
            
        Returns:
            Dictionary suitable for the React visualization components
        """
        return {
            "id": int(agent.id) if agent.id.isdigit() else hash(agent.id) % 1000,
            "position": agent.position,
            "state": self._map_state(agent.state),
            "nearby_agents": [int(a) if a.isdigit() else hash(a) % 1000 for a in agent.nearby_agents],
            "reasoning": agent.reasoning,
            "name": agent.name,
            "model": agent.model,
            "channel": agent.channel
        }
    
    def _map_state(self, openclaw_state: str) -> str:
        """Map OpenClaw state to visualization state"""
        state_map = {
            "idle": "idle",
            "working": "working",
            "thinking": "reasoning",
            "reasoning": "reasoning",
            "communicating": "communicating",
            "error": "error"
        }
        return state_map.get(openclaw_state.lower(), "idle")


class OpenClawIntegration:
    """
    High-level integration manager for OpenClaw connection.
    
    Handles:
    - Gateway connection lifecycle
    - Agent data polling
    - State synchronization
    - Error recovery
    """
    
    def __init__(
        self,
        gateway_url: str = "http://localhost:18789",
        poll_interval: float = 5.0,
        on_agents_update: Optional[Callable[[List[Dict]], None]] = None
    ):
        self.gateway_url = gateway_url
        self.poll_interval = poll_interval
        self.on_agents_update = on_agents_update
        
        self.client = OpenClawGatewayClient(gateway_url=gateway_url)
        self._running = False
        self._poll_task: Optional[asyncio.Task] = None
        
    async def start(self) -> bool:
        """Start the integration and begin polling"""
        connected = await self.client.connect()
        if not connected:
            return False
        
        self._running = True
        self._poll_task = asyncio.create_task(self._poll_loop())
        return True
    
    async def stop(self):
        """Stop the integration"""
        self._running = False
        if self._poll_task:
            self._poll_task.cancel()
            try:
                await self._poll_task
            except asyncio.CancelledError:
                pass
        await self.client.disconnect()
    
    async def _poll_loop(self):
        """Background polling loop for agent updates"""
        while self.__running:
            try:
                agents = await self.client.get_active_agents()
                visualization_agents = [
                    self.client.map_agent_to_visualization(a)
                    for a in agents
                ]
                
                if self.on_agents_update:
                    self.on_agents_update(visualization_agents)
                    
            except Exception as e:
                print(f"Error polling agents: {e}")
            
            await asyncio.sleep(self.poll_interval)
    
    async def get_agents_for_visualization(self) -> List[Dict[str, Any]]:
        """Get current agents in visualization format"""
        agents = await self.client.get_active_agents()
        return [
            self.client.map_agent_to_visualization(a)
            for a in agents
        ]


# Singleton instance for easy access
_integration: Optional[OpenClawIntegration] = None


async def get_integration(
    gateway_url: str = "http://localhost:18789",
    poll_interval: float = 5.0
) -> OpenClawIntegration:
    """Get or create the OpenClaw integration singleton"""
    global _integration
    if _integration is None:
        _integration = OpenClawIntegration(
            gateway_url=gateway_url,
            poll_interval=poll_interval
        )
        await _integration.start()
    return _integration


async def shutdown_integration():
    """Shutdown the integration singleton"""
    global _integration
    if _integration:
        await _integration.stop()
        _integration = None
