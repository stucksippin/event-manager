import { NextResponse }      from 'next/server'
import { getServerSession }  from 'next-auth/next'
import { authOptions }       from '../../auth/[...nextauth]/route'
import prisma                from '../../../../libs/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const userId = session.user.id

  // 1) Личные календари
  const personal = prisma.calendar.findMany({
    where: { ownerId: userId, type: 'user' }
  })

  // 2) Team-календарь, который вы создали (owner)
  const ownedTeams = prisma.calendar.findMany({
    where: { ownerId: userId, type: 'team' }
  })

  // 3) Team-календари, в которые вы **приняли** приглашение
  const invitedTeams = prisma.calendar.findMany({
    where: {
      type: 'team',
      invitations: {
        some: { inviteeId: userId, status: 'ACCEPTED' }
      }
    }
  })

  // Собираем всё вместе
  const calendars = [
    ...(await personal),
    ...(await ownedTeams),
    ...(await invitedTeams)
  ]

  return NextResponse.json(calendars)
}