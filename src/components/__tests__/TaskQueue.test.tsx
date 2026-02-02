import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import TaskQueue, { Task } from '../TaskQueue'

describe('TaskQueue', () => {
  const demoTasks: Task[] = [
    { id: 't1', name: 'Design UI', status: 'pending', assignee: 'Agent 1' },
    { id: 't2', name: 'Implement backend', status: 'in_progress', assignee: 'Agent 2' },
    { id: 't3', name: 'Write tests', status: 'completed', assignee: 'Agent 3' },
  ]

  it('renders task list', () => {
    const { container } = render(<TaskQueue tasks={demoTasks} />)
    expect(container.textContent).toContain('Design UI')
    expect(container.textContent).toContain('Implement backend')
    expect(container.textContent).toContain('Write tests')
  })

  it('filters tasks by status', () => {
    const { container, getByLabelText } = render(<TaskQueue tasks={demoTasks} />)
    const filter = getByLabelText('Task Filter') as HTMLSelectElement
    fireEvent.change(filter, { target: { value: 'in_progress' } })
    expect(container.textContent).toContain('Implement backend')
    expect(container.textContent).not.toContain('Design UI')
  })

  it('adds a new task', () => {
    const { getByLabelText, getByText, container } = render(<TaskQueue tasks={demoTasks} />)
    const nameInput = getByLabelText('Task Name') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'New Task' } })
    fireEvent.click(getByText('Add Task'))
    expect(container.textContent).toContain('New Task')
  })

  it('shows task details on click', () => {
    const { getByText, container } = render(<TaskQueue tasks={demoTasks} />)
    fireEvent.click(getByText('Design UI'))
    expect(container.textContent).toContain('Task Details')
    expect(container.textContent).toContain('Design UI')
  })
})
