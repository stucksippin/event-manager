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
  List,
  Avatar,
  Popconfirm,
  message,
} from 'antd'
import useCalendarStore from '../../../store/useCalendarStore'
import CalendarView from '../../../components/CalendarView'
import TaskList from '../../../components/TaskList'

const { Content } = Layout
const { Title, Text } = Typography

export default function CalendarPage() {
  const { id: calendarId } = useParams()
  const { data: session, status } = useSession()

  const calendars = useCalendarStore((s) => s.calendars)
  const fetchCalendars = useCalendarStore((s) => s.fetchCalendars)

  const [calendar, setCalendar] = useState(null)
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState(null)
  const [inviteSuccess, setInviteSuccess] = useState(null)
  const [loadingInvite, setLoadingInvite] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  useEffect(() => {
    if (session) fetchCalendars()
  }, [session, fetchCalendars])

  useEffect(() => {
    setCalendar(calendars.find((c) => c.id === calendarId) || null)
  }, [calendars, calendarId])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!calendarId) return
      setLoadingMembers(true)
      const res = await fetch(`/api/calendars/${calendarId}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
      setLoadingMembers(false)
    }
    fetchMembers()
  }, [calendarId])

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
      // обновим список участников после приглашения
      const updated = await fetch(`/api/calendars/${calendarId}/members`)
      if (updated.ok) setMembers(await updated.json())
    }
  }

  return (
    <Content style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>{calendar.name}</Title>
        <Text>{calendar.type === 'user' ? 'Личный' : 'Командный'} календарь</Text>
      </Card>


      {/* участники  */}
      {isTeam && (
        <Card title="Участники" style={{ marginBottom: 24 }}>
          <List
            loading={loadingMembers}
            dataSource={members}
            renderItem={(member) => (
              <List.Item
                key={member.id}
                actions={
                  isOwner && member.id !== session.user.id
                    ? [
                      <Popconfirm
                        key={member.id}
                        title="Удалить участника?"
                        description={`Вы уверены, что хотите удалить ${member.email}?`}
                        okText="Да"
                        cancelText="Нет"
                        onConfirm={async () => {
                          const res = await fetch(
                            `/api/calendars/${calendarId}/members/${member.id}`,
                            { method: "DELETE" }
                          )
                          if (res.ok) {
                            setMembers(members.filter((m) => m.id !== member.id))
                            message.success('Пользователь удален из календаря')
                          }
                        }}
                      >
                        <Button danger size="small">Удалить</Button>
                      </Popconfirm>,
                    ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={member.image}>{member.name?.[0]}</Avatar>}
                  title={member.name || member.email}
                  description={member.email}
                />
              </List.Item>
            )}
          />

        </Card>
      )}

      {/* Список задач */}
      <TaskList calendarId={calendarId} selectedDate={selectedDate} />
      {/* Основной календарь */}
      <CalendarView calendarId={calendarId} onDateSelect={setSelectedDate} />


      {/* инвайт модалка */}
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
    </Content>
  )
}
