import { useMemo, useState } from 'react'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Task {
  id: string
  name: string
  status: TaskStatus
  assignee?: string
}

interface TaskQueueProps {
  tasks: Task[]
}

function TaskQueue({ tasks }: TaskQueueProps) {
  const [allTasks, setAllTasks] = useState<Task[]>(tasks)
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTaskName, setNewTaskName] = useState('')

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return allTasks
    return allTasks.filter((t) => t.status === filter)
  }, [allTasks, filter])

  const addTask = () => {
    if (!newTaskName.trim()) return
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
      status: 'pending',
    }
    setAllTasks((prev) => [...prev, newTask])
    setNewTaskName('')
  }

  return (
    <div className="task-queue" data-testid="task-queue">
      <div className="task-queue-header">
        <h3>Task Queue</h3>
        <select
          aria-label="Task Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as TaskStatus | 'all')}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="task-add">
        <input
          aria-label="Task Name"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="New task name"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id}>
            <button onClick={() => setSelectedTask(task)}>{task.name}</button>
          </li>
        ))}
      </ul>

      {selectedTask && (
        <div className="task-details">
          <h4>Task Details</h4>
          <p><strong>Name:</strong> {selectedTask.name}</p>
          <p><strong>Status:</strong> {selectedTask.status}</p>
          {selectedTask.assignee && (
            <p><strong>Assignee:</strong> {selectedTask.assignee}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskQueue
