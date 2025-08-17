import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'


export async function POST(req) {
  try {
    // 1) Авторизация
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const userId = session.user.id

    // 2) Получаем данные из тела
    const { calendarId, title, description, date } = await req.json()
    if (!calendarId || !title || !date) {
      return NextResponse.json(
        { error: 'Missing calendarId, title or date' },
        { status: 400 }
      )
    }

    // 3) Проверяем доступ к календарю
    const cal = await prisma.calendar.findUnique({
      where: { id: calendarId },
      select: { type: true, ownerId: true, members: { select: { id: true } } }
    })
    if (!cal) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 })
    }
    const isOwner = cal.ownerId === userId
    const isMember = cal.type === 'team' && cal.members.some(m => m.id === userId)
    if (!(isOwner || isMember)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 4) Создаём задачу
    const task = await prisma.task.create({
      data: {
        calendarId,
        title,
        description: description || null,
        date: new Date(date)
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error('🔥 Error in POST /api/tasks/create:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
