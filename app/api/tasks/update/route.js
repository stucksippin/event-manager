import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/auth.config'
import prisma from '@/libs/prisma'

export async function PUT(req) {
  try {
    // 1) Авторизация
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const userId = session.user.id

    // 2) Данные из тела
    const { id, title, description, date } = await req.json()
    if (!id || !title || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // 3) Проверяем доступ к задаче через её календарь
    const task = await prisma.task.findUnique({
      where: { id },
      select: { calendar: { select: { ownerId: true, type: true, members: { select: { id: true } } } } }
    })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    const cal = task.calendar
    const isOwner = cal.ownerId === userId
    const isMember = cal.type === 'team' && cal.members.some(m => m.id === userId)
    if (!(isOwner || isMember)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 4) Обновляем
    const updated = await prisma.task.update({
      where: { id },
      data: {
        title,
        description: description || null,
        date: new Date(date)
      }
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('🔥 Error in PUT /api/tasks/update:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
