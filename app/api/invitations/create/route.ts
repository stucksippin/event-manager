import { NextResponse } from 'next/server'
import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'


interface RequestBody {
  calendarId: string
  inviteeEmail: string
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не аутентифицирован' }, { status: 401 })
    }

    const { calendarId, inviteeEmail }: RequestBody = await req.json()
    if (!calendarId || !inviteeEmail) {
      return NextResponse.json({ error: 'Отсутствует calendarId или inviteeEmail' }, { status: 400 })
    }

    const invitee = await prisma.user.findUnique({ where: { email: inviteeEmail } })
    if (!invitee) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const invitation = await prisma.invitation.create({
      data: {
        calendarId,
        inviterId: session.user.id,
        inviteeId: invitee.id,
        status: 'PENDING',
      }
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    console.error('Ошибка при создании приглашения:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
