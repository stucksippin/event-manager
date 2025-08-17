'use client'

import { useEffect } from 'react'
import { Calendar as AntdCalendar, Badge } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import useTaskStore from '../store/useTaskStore'

dayjs.locale('ru')

export default function CalendarView({ calendarId, onDateSelect }) {
  const tasks = useTaskStore(state => state.tasks)
  const fetchTasks = useTaskStore(state => state.fetchTasks)

  useEffect(() => {
    fetchTasks(calendarId)
  }, [calendarId, fetchTasks])

  // Рендерим только задачи (без даты!)
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

  const cellRender = (current, info) => {
    if (info.type === 'date') {
      const isPast = current.isBefore(dayjs(), 'day')
      return (
        <div
          style={{
            background: isPast ? '#f5f5f5' : undefined,
            minHeight: 60,
            pointerEvents: isPast ? 'none' : undefined,
          }}
        >

          {renderDateCell(current)}
        </div>
      )
    }
    return info.originNode
  }

  const handleSelect = (value) => {
    if (value.isBefore(dayjs(), 'day')) return
    onDateSelect?.(value)
  }

  return <AntdCalendar cellRender={cellRender} onSelect={handleSelect} />
}
