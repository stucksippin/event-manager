'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layout,
  Menu,
  Button,
  Input,
  Modal,
  Typography,
  Tooltip
} from 'antd'
import {
  CalendarOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  FileOutlined
} from '@ant-design/icons'
import useCalendarStore from '../store/useCalendarStore'
import { signOut, useSession } from 'next-auth/react'

const { Sider } = Layout
const { Text } = Typography

export default function Sidebar() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [collapsed, setCollapsed] = useState(false)
  const [newCalendarName, setNewCalendarName] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchCalendars = useCalendarStore((s) => s.fetchCalendars)
  const addCalendar = useCalendarStore((s) => s.addCalendar)
  const calendars = useCalendarStore((s) => s.calendars)

  useEffect(() => {
    if (session) fetchCalendars()
  }, [session, fetchCalendars])

  const handleCalendarClick = (id) => {
    router.push(`/calendar/${id}`)
  }

  const wrapLabel = (label) =>
    collapsed ? <Tooltip title={label}>{label}</Tooltip> : label

  const menuItems = [
    {
      key: 'main',
      icon: <FileOutlined />,
      label: wrapLabel('Главная'),
      onClick: () => router.push(`/`)
    },
    {
      key: 'user-calendars',
      icon: <UserOutlined />,
      label: wrapLabel('Мои календари'),
      children:
        calendars.filter((cal) => cal.type === 'user').length > 0
          ? calendars
            .filter((cal) => cal.type === 'user')
            .map((cal) => ({
              key: cal.id,
              label: wrapLabel(cal.name),
              icon: <CalendarOutlined />,
              onClick: () => handleCalendarClick(cal.id)
            }))
          : [
            {
              key: 'no-user-calendars',
              label: wrapLabel('Календарей нет'),
              disabled: true
            }
          ]
    },
    {
      key: 'team-calendars',
      icon: <TeamOutlined />,
      label: wrapLabel('Командные календари'),
      children:
        calendars.filter((cal) => cal.type === 'team').length > 0
          ? calendars
            .filter((cal) => cal.type === 'team')
            .map((cal) => ({
              key: cal.id,
              label: wrapLabel(cal.name),
              icon: <CalendarOutlined />,
              onClick: () => handleCalendarClick(cal.id)
            }))
          : [
            {
              key: 'no-team-calendars',
              label: wrapLabel('Календарей нет'),
              disabled: true
            }
          ]
    }
  ]

  return (
    <>
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <Menu
          theme="dark"
          mode="inline"
          inlineCollapsed={collapsed}
          items={menuItems}
        />

        {session && (
          <>
            {/* Кнопка создания */}
            <div style={{ padding: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                block
              >
                {!collapsed && 'Новый календарь'}
              </Button>
            </div>

            {/* Инфо об аккаунте */}
            {!collapsed && (
              <div style={{ padding: '0 16px', marginTop: 8 }}>
                <Text style={{ color: '#fff' }}>
                  Аккаунт: {session.user.email}
                </Text>
              </div>
            )}

            {/* Кнопка выхода */}
            <div style={{ padding: 16 }}>
              <Button
                type="text"
                danger
                block
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                {!collapsed && 'Выйти из аккаунта'}
              </Button>
            </div>
          </>
        )}
      </Sider>

      {/* Модалка создания календаря */}
      <Modal
        title="Создать календарь"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button
            key="user"
            onClick={() => {
              addCalendar(newCalendarName, 'user')
              setIsModalOpen(false)
              setNewCalendarName('')
            }}
          >
            Личный
          </Button>,
          <Button
            key="team"
            type="primary"
            onClick={() => {
              addCalendar(newCalendarName, 'team')
              setIsModalOpen(false)
              setNewCalendarName('')
            }}
          >
            Командный
          </Button>
        ]}
      >
        <Input
          placeholder="Название календаря"
          value={newCalendarName}
          onChange={(e) => setNewCalendarName(e.target.value)}
        />
      </Modal>
    </>
  )
}
