'use client'

import './globals.css'
import '@ant-design/v5-patch-for-react-19'
import { SessionProvider } from 'next-auth/react'
import Sidebar from '../components/Sidebar'
import { usePathname } from 'next/navigation'
import { Layout } from 'antd'

const { Content, Footer } = Layout

export default function RootClientLayout({ children }) {
  const path = usePathname()
  const isAuth = path.startsWith('/login') || path.startsWith('/register')

  return (
    <SessionProvider>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Сайдбар только на «обычных» страницах */}
        {!isAuth && <Sidebar />}
        <Layout>
          <Content style={{ margin: '15px 16px' }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: '#fff',
                borderRadius: 8,
              }}
            >
              {children}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </SessionProvider>
  )
}