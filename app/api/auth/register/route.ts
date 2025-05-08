import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const prisma = new PrismaClient()
  const { name, email, password } = await req.json()
  console.log(name, email, password);

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email и пароль обязательны' },
      { status: 400 }
    )
  }

  console.log('17____________________________________________');
  // const exists = await prisma.user.findUnique({ where: { email: email } })
  // if (exists) {
  //   return NextResponse.json(
  //     { error: 'Пользователь с таким email уже существует' },
  //     { status: 409 }
  //   )
  // }

  console.log('18____________________________________________');
  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      passwordHash: hash
    }
  })
  return NextResponse.json(
    { id: user.id, email: user.email },
    { status: 201 }
  )
}
