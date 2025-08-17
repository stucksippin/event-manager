import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/libs/prisma"
import { authOptions } from "@/libs/auth"

interface RequestBody {
  calendarId: string
  inviteeEmail: string
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)


  if (!session || !session.user?.id || !session.user?.email) {
    return NextResponse.json({ error: "Не аутентифицирован" }, { status: 401 })
  }


  const { calendarId, inviteeEmail }: RequestBody = await req.json()


  console.log("SESSION in POST:", JSON.stringify(session, null, 2))
  console.log("inviteeEmail (raw):", inviteeEmail)
  console.log("inviteeEmail (trim lower):", inviteeEmail.trim().toLowerCase())
  console.log("session.user.email (lower):", session.user.email.toLowerCase())


  // Запрет приглашать себя
  if (inviteeEmail.trim().toLowerCase() === session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "Нельзя пригласить самого себя" }, { status: 400 })
  }

  // Проверяем, что календарь существует
  const calendar = await prisma.calendar.findUnique({
    where: { id: calendarId },
    include: { members: true }
  })
  if (!calendar) {
    return NextResponse.json({ error: "Календарь не найден" }, { status: 404 })
  }

  // Ищем приглашаемого пользователя
  const invitee = await prisma.user.findUnique({
    where: { email: inviteeEmail }
  })
  if (!invitee) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
  }

  // Уже ли в календаре
  if (calendar.members.some(m => m.id === invitee.id)) {
    return NextResponse.json({ error: "Пользователь уже в календаре" }, { status: 400 })
  }

  // Уже ли есть активное приглашение
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      calendarId,
      inviteeId: invitee.id,
      status: "PENDING"
    }
  })
  if (existingInvite) {
    return NextResponse.json({ error: "Приглашение уже отправлено" }, { status: 400 })
  }

  // Создаём приглашение
  const invitation = await prisma.invitation.create({
    data: {
      calendarId,
      inviterId: session.user.id,
      inviteeId: invitee.id,
      status: "PENDING"
    }
  })



  return NextResponse.json(invitation, { status: 201 })
}
