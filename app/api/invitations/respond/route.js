import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'



export async function POST(req) {
  const { invitationId, action } = await req.json()

  // 1) Сессия
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Не аутентифицирован' }, { status: 401 })
  }

  // 2) Берём приглашение
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { calendar: true }
  })
  if (!invite) {
    return NextResponse.json({ error: 'Приглашение не найдено' }, { status: 404 })
  }

  // 3) Только приглашённый может отвечать
  if (invite.inviteeId !== session.user.id) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  // 4) Если уже отвечено
  if (invite.status !== 'PENDING') {
    return NextResponse.json({ error: 'Уже обработано' }, { status: 400 })
  }

  // 5) В зависимости от action
  if (action === 'ACCEPT') {
    // 5a) Обновляем статус
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' }
    })
    // 5b) Добавляем связь «пользователь — календарь»
    await prisma.calendar.update({
      where: { id: invite.calendarId },
      data: {
        members: {
          connect: { id: session.user.id }
        }
      }
    })
  } else if (action === 'REJECT') {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'REJECTED' }
    })
  } else {
    return NextResponse.json({ error: 'Неверное действие' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}