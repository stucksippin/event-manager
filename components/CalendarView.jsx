'use client'

import { useEffect } from 'react'
import { Calendar as AntdCalendar, Badge } from 'antd'
import dayjs from 'dayjs'
import useTaskStore from '../store/useTaskStore'

export default function CalendarView({ calendarId }) {
  // Отдельные селекторы Zustand, чтобы не было бесконечных обновлений
  const tasks      = useTaskStore(state => state.tasks)
  const fetchTasks = useTaskStore(state => state.fetchTasks)

  // Подгружаем задачи при монтировании или смене calendarId
  useEffect(() => {
    fetchTasks(calendarId)
  }, [calendarId, fetchTasks])

  // Функция рендера содержимого ячейки с датой
  const renderDateCell = (value) => {
    const dateStr = value.format('YYYY-MM-DD')
    const dayTasks = tasks.filter(
      t => dayjs(t.date).format('YYYY-MM-DD') === dateStr
    )
    if (dayTasks.length === 0) return null

    return (
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {dayTasks.map(item => (
          <li key={item.id}>
            <Badge status="success" text={item.title} />
          </li>
        ))}
      </ul>
    )
  }

  // Новый проп cellRender вместо deprecated dateCellRender
  const cellRender = (current, info) => {
    // только для обычных «дата»-ячееек
    if (info.type === 'date') {
      return renderDateCell(current)
    }
    // для month/year и т.п. рендерим как есть
    return info.originNode
  }

  return <AntdCalendar cellRender={cellRender} />
}
