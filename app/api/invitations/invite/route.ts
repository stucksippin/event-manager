import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/libs/prisma"

interface RequestBody {
  calendarId: string
  inviteeEmail: string
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Не аутентифицирован" }, { status: 401 })
  }

  const { calendarId, inviteeEmail }: RequestBody = await req.json()

  // найдём приглашённого пользователя по email
  const invitee = await prisma.user.findUnique({ where: { email: inviteeEmail } })
  if (!invitee) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
  }

  // создадим приглашение
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
