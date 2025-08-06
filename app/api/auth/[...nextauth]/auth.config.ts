// app/api/auth/[...nextauth]/auth.config.ts
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/libs/prisma'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'

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
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email }
                })
                if (!user) return null

                const isValid = await bcrypt.compare(credentials?.password || '', user.passwordHash)
                if (!isValid) return null

                return { id: user.id, email: user.email, name: user.name }
            }
        })
    ],
    session: { strategy: 'jwt' },
    callbacks: {
        async session({ session, token }) {
            if (token.sub) session.user.id = token.sub
            return session
        },
        async jwt({ token, user }) {
            if (user?.id) token.sub = user.id
            return token
        }
    },
    pages: {
        signIn: '/login'
    },
    debug: false,
}