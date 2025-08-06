import { NextResponse } from 'next/server'
import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth.config'


export async function POST(req: Request) {
  // 1) проверяем сессию
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      { error: 'Не аутентифицирован' },
      { status: 401 }
    )
  }

  // 2) тянем pending-приглашения
  const invites = await prisma.invitation.findMany({
    where: {
      inviteeId: session.user.id,
      status: 'PENDING'
    },
    include: {
      calendar: { select: { id: true, name: true } },
      inviter: { select: { email: true } }
    }
  })

  // 3) возвращаем
  return NextResponse.json(invites)
}
