import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from '../../../../libs/prisma'

export async function DELETE(req) {
  try {
    // 1) Авторизация
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const userId = session.user.id

    // 2) Прочитать id задачи из query или тела
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 })
    }

    // 3) Проверка доступа через календарь
    const task = await prisma.task.findUnique({
      where: { id },
      select: { calendar: { select: { ownerId: true, type: true, members: { select: { id: true } } } } }
    })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    const cal = task.calendar
    const isOwner  = cal.ownerId === userId
    const isMember = cal.type === 'team' && cal.members.some(m => m.id === userId)
    if (!(isOwner || isMember)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 4) Удаляем
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('🔥 Error in DELETE /api/tasks/delete:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
