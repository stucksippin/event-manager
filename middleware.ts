import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',      // куда отправлять, если нет сессии
  },
})
export const config = {
  matcher: ['/((?!api|_next|favicon|login|register).*)']
}