// app/api/calendars/create/route.ts

import { NextResponse } from 'next/server'
import prisma from '../../../../libs/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

interface RequestBody {
  name: string;
  type: 'personal' | 'team'; // или другие возможные типы календарей
}

export async function POST(req: Request) {
  try {
    // 1) Проверяем сессию
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2) Читаем тело запроса
    const { name, type } = await req.json() as RequestBody
    if (!name || !type) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // 3) Создаём календарь, сразу подключая себя в members, если это team
    const calendar = await prisma.calendar.create({
      data: {
        name,
        type,
        ownerId: session.user.id,
        members: {
          connect:
            type === 'team'
              ? [{ id: session.user.id }]
              : []
        },
      },
    })

    // 4) Отдаём созданный объект
    return NextResponse.json(calendar, { status: 201 })
  } catch (err: unknown) {
    console.error('🔥 Error in POST /api/calendars/create:', err)
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}