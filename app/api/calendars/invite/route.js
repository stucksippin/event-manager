import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'  // если твои next-auth маршруты лежат в /api/auth
import prisma from '../../../../libs/prisma'

export async function POST(req) {
  const { calendarId, email } = await req.json()

  // 1) Проверяем сессию
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Не аутентифицирован' }, { status: 401 })
  }

  // 2) Проверяем, что текущий пользователь — владелец календаря
  const cal = await prisma.calendar.findUnique({ where: { id: calendarId } })
  if (!cal || cal.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  // 3) Находим пользователя-приглашённого по email
  const invitee = await prisma.user.findUnique({ where: { email } })
  if (!invitee) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
  }

  // 4) Проверяем, не было ли уже приглашения
  const exists = await prisma.invitation.findFirst({
    where: {
      calendarId,
      inviteeId: invitee.id,
      status: 'PENDING'
    }
  })
  if (exists) {
    return NextResponse.json({ error: 'Пользователь уже приглашён' }, { status: 400 })
  }

  // 5) Создаём новую запись в invitations
  await prisma.invitation.create({
    data: {
      calendarId,
      inviterId: session.user.id,
      inviteeId: invitee.id,
      status: 'PENDING'
    }
  })

  return NextResponse.json({ success: true })
}