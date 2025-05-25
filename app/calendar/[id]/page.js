'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Layout,
  Card,
  Typography,
  Input,
  Button,
  Alert,
} from 'antd'
import useCalendarStore from '../../../store/useCalendarStore'
import CalendarView from '../../../components/CalendarView'      // ← Импортируем наш календарь
import TaskList from '../../../components/TaskList'           // ← если хотите ещё и список задач
import InviteModal from "../../../components/InviteModal"

const { Content } = Layout
const { Title, Text } = Typography

export default function CalendarPage() {
  const { id: calendarId } = useParams()
  const { data: session, status } = useSession()

  const calendars = useCalendarStore((s) => s.calendars)
  const fetchCalendars = useCalendarStore((s) => s.fetchCalendars)

  const [calendar, setCalendar] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState(null)
  const [inviteSuccess, setInviteSuccess] = useState(null)
  const [loadingInvite, setLoadingInvite] = useState(false)

  useEffect(() => {
    if (session) fetchCalendars()
  }, [session, fetchCalendars])

  useEffect(() => {
    setCalendar(calendars.find((c) => c.id === calendarId) || null)
  }, [calendars, calendarId])

  if (status === 'loading' || !session) {
    return <div>Загрузка...</div>
  }
  if (!calendar) {
    return <div>Календарь не найден...</div>
  }

  const isTeam = calendar.type === 'team'
  const isOwner = calendar.ownerId === session.user.id

  const handleInvite = async () => {
    setInviteError(null)
    setInviteSuccess(null)
    setLoadingInvite(true)
    const res = await fetch('/api/calendars/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId, email: inviteEmail })
    })
    const json = await res.json()
    setLoadingInvite(false)

    if (!res.ok) {
      setInviteError(json.error)
    } else {
      setInviteSuccess(`Пользователь ${inviteEmail} приглашён`)
      setInviteEmail('')
    }
  }

  return (
    <Content style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>{calendar.name}</Title>
        <Text>Тип: {calendar.type === 'user' ? 'Личный' : 'Командный'}</Text>
      </Card>

      {isTeam && isOwner && (
        <Card
          title="Пригласить участника по email"
          style={{ marginBottom: 24, maxWidth: 400 }}
        >
          <Input
            placeholder="Email пользователя"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <Button
            type="primary"
            onClick={handleInvite}
            loading={loadingInvite}
            block
          >
            Пригласить
          </Button>
          {inviteError && <Alert type="error" message={inviteError} style={{ marginTop: 8 }} />}
          {inviteSuccess && <Alert type="success" message={inviteSuccess} style={{ marginTop: 8 }} />}
        </Card>
      )}

      {/* Если хотите список задач под календарём */}
      <TaskList calendarId={calendarId} />
      {/* Основной календарь с задачами */}
      <CalendarView calendarId={calendarId} />

    </Content>
  )
}
