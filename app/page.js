import React from 'react'
import prisma from '../libs/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../app/api/auth/[...nextauth]/route'
import DashboardUI from '../components/DashboardUI'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // 1) Проверяем сессию
  const session = await getServerSession(authOptions)
  if (!session) {
    // если нет сессии, редиректим на логин
    redirect('/login')
  }
  const userId = session.user.id

  // 2) Считаем личные задачи
  const personalCount = await prisma.task.count({
    where: {
      calendar: {
        ownerId: userId,
        type: 'user',
      },
    },
  })

  // 3) Считаем командные задачи по членству в календаре
  const teamCount = await prisma.task.count({
    where: {
      calendar: {
        type: 'team',
        members: {
          some: { id: userId },
        },
      },
    },
  })

  // 4) Получаем pending-приглашения для блока “Приглашения”
  const invites = await prisma.invitation.findMany({
    where: { inviteeId: userId, status: 'PENDING' },
    include: {
      calendar: { select: { id: true, name: true } },
      inviter:  { select: { email: true } },
    },
  })

  // 5) Рендерим UI
  return (
    <DashboardUI
      personalCount={personalCount}
      teamCount={teamCount}
      invites={invites}
    />
  )
}