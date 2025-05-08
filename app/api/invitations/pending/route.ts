import { NextResponse } from 'next/server'
import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect('/login')

  const invites = await prisma.invitation.findMany({
    where: {
      inviteeId: session.user.id,
      status: 'PENDING',
    },
    include: {
      calendar: true,
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json(invites)
}
