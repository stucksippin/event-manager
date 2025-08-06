import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import prisma from '@/libs/prisma'
import { authOptions } from '../../auth/[...nextauth]/auth.config'

// 1. Определяем строгие типы
type CalendarType = 'personal' | 'team'
interface RequestBody {
  name: string
  type: CalendarType
}

// 2. Вспомогательная функция для валидации
function validateRequestBody(body: any): body is RequestBody {
  return (
    typeof body === 'object' &&
    typeof body.name === 'string' &&
    ['personal', 'team'].includes(body.type)
  )
}

export async function POST(request: Request) {
  try {
    // 3. Проверка аутентификации
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 4. Чтение и валидация тела запроса
    let requestBody
    try {
      requestBody = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    if (!validateRequestBody(requestBody)) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: {
            required: {
              name: 'string',
              type: "'personal' or 'team'"
            },
            received: requestBody
          }
        },
        { status: 400 }
      )
    }

    // 5. Создание календаря
    const calendarData: any = {
      name: requestBody.name,
      type: requestBody.type,
      ownerId: session.user.id
    }

    if (requestBody.type === 'team') {
      calendarData.members = {
        connect: [{ id: session.user.id }]
      }
    }

    const calendar = await prisma.calendar.create({
      data: calendarData,
      include: {
        members: true
      }
    })

    // 6. Успешный ответ
    return NextResponse.json(calendar, { status: 201 })

  } catch (error) {
    // 7. Обработка всех возможных ошибок
    console.error('Calendar creation error:', error)

    if (error instanceof Error) {
      // Обработка ошибок Prisma
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Calendar with this name already exists' },
          { status: 409 }
        )
      }

      // Обработка других ошибок БД
      if (error.message.includes('prisma') || error.message.includes('database')) {
        return NextResponse.json(
          { error: 'Database operation failed' },
          { status: 500 }
        )
      }
    }

    // Общая ошибка сервера
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}