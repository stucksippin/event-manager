import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/libs/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Email & Password',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Пароль', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })
                if (!user) return null

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
                if (!isValid) return null

                return { id: user.id, email: user.email, name: user.name }
            }
        })
    ],
    session: { strategy: 'jwt' },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            if (session.user && token.email) {
                session.user.email = token.email
            }
            return session
        },
        async jwt({ token, user }) {
            if (user?.id) token.sub = user.id
            if (user?.email) token.email = user.email
            return token
        },
        async redirect({ baseUrl }) {
            return baseUrl
        }
    },
    pages: { signIn: '/login' },
    debug: false
}
