'use client'
import React from 'react'
import { Row, Col, Card, Statistic, Typography, Space, Button, message } from 'antd'
import { useRouter } from 'next/navigation'

const { Title } = Typography

export default function DashboardUI({ personalCount, teamCount, invites = [] }) {
  const router = useRouter()

  const respond = async (invId, action) => {
    try {
      const res = await fetch('/api/invitations/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: invId, action })
      })
      if (!res.ok) throw new Error()
      message.success(action === 'ACCEPT' ? 'Приглашение принято' : 'Приглашение отклонено')
      router.refresh()
    } catch {
      message.error('Ошибка, попробуйте снова')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Статистика</Title>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            <Statistic title="Личные задачи" value={personalCount} />
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            <Statistic title="Командные задачи" value={teamCount} />
          </Card>
        </Col>
      </Row>

      {invites.length > 0 && (
        <Card title="Приглашения" style={{ marginTop: 24 }}>
          {invites.map(inv => (
            <div key={inv.id} style={{ marginBottom: 16 }}>
              <b>{inv.calendar.name}</b> — вас пригласил {inv.inviter.email}
              <Space style={{ marginLeft: 16 }}>
                <Button type="primary" onClick={() => respond(inv.id, 'ACCEPT')}>
                  Принять
                </Button>
                <Button danger onClick={() => respond(inv.id, 'REJECT')}>
                  Отклонить
                </Button>
              </Space>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}