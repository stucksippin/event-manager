import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/auth.config'
import prisma from '@/libs/prisma'

export async function GET(req) {
  try {
    // 1) Проверяем авторизацию
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const userId = session.user.id

    // 2) Читаем ID календаря из query
    const url = new URL(req.url)
    const calendarId = url.searchParams.get('calendarId')
    if (!calendarId) {
      return NextResponse.json({ error: 'calendarId is required' }, { status: 400 })
    }

    // 3) Проверяем, что пользователь имеет доступ к этому календарю
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      select: { type: true, ownerId: true, members: { select: { id: true } } }
    })
    if (!calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 })
    }
    const isOwner = calendar.ownerId === userId
    const isMember = calendar.type === 'team' && calendar.members.some(m => m.id === userId)
    if (!(isOwner || isMember)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 4) Получаем задачи для этого календаря
    const tasks = await prisma.task.findMany({
      where: { calendarId },
      orderBy: { date: 'asc' }
    })

    // 5) Отдаём их клиенту
    return NextResponse.json(tasks)
  } catch (err) {
    console.error('🔥 Error in GET /api/tasks/list:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
