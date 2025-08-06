import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/libs/prisma';
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' }
      },
      async authorize(credentials) {
        console.log(credentials);

        // 1) находим пользователя по email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user) return null

        // 2) проверяем пароль
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        // 3) возвращаем объект user (без пароля)
        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    async redirect({ baseUrl }) {
      return baseUrl
    }
  },
  pages: {
    signIn: '/login'     // мы создадим эту страницу
  },
  debug: false,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
