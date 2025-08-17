import React from 'react'

import { getServerSession } from 'next-auth/next'
import DashboardUI from '../components/DashboardUI'
import { redirect } from 'next/navigation'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'

export default async function DashboardPage() {

  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }
  const userId = session.user.id

  //  личные задачи
  const personalCount = await prisma.task.count({
    where: {
      calendar: {
        ownerId: userId,
        type: 'user',
      },
    },
  })

  // 3) командные задачи по членству в календаре
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

  // 4) pending-приглашения для блока “Приглашения”
  const invites = await prisma.invitation.findMany({
    where: { inviteeId: userId, status: 'PENDING' },
    include: {
      calendar: { select: { id: true, name: true } },
      inviter: { select: { email: true } },
    },
  })


  return (
    <DashboardUI
      personalCount={personalCount}
      teamCount={teamCount}
      invites={invites}
    />
  )
}