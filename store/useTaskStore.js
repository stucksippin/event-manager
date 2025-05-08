import { create } from 'zustand'

const useTaskStore = create((set, get) => ({
  tasks: [],
  // Загрузить список задач для данного календаря
  fetchTasks: async (calendarId) => {
    try {
      const res = await fetch(`/api/tasks/list?calendarId=${calendarId}`)
      if (!res.ok) throw new Error(`Ошибка ${res.status}`)
      const data = await res.json()
      set({ tasks: data })
    } catch (err) {
      console.error('fetchTasks error:', err)
      set({ tasks: [] })
    }
  },
  // Создать новую задачу
  addTask: async ({ calendarId, title, description, date }) => {
    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId, title, description, date })
      })
      if (!res.ok) throw new Error(`Ошибка ${res.status}`)
      const newTask = await res.json()
      set((state) => ({ tasks: [...state.tasks, newTask] }))
    } catch (err) {
      console.error('addTask error:', err)
    }
  },
  // Обновить задачу
  updateTask: async ({ id, title, description, date }) => {
    try {
      const res = await fetch('/api/tasks/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, description, date })
      })
      if (!res.ok) throw new Error(`Ошибка ${res.status}`)
      const updated = await res.json()
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t))
      }))
    } catch (err) {
      console.error('updateTask error:', err)
    }
  },
  // Удалить задачу
  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/delete?id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`Ошибка ${res.status}`)
      await res.json()
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
    } catch (err) {
      console.error('deleteTask error:', err)
    }
  }
}))

export default useTaskStore