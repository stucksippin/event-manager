'use client'

import { Layout, ConfigProvider, theme } from 'antd'
import Sidebar from '@/components/Sidebar'

const { Content, Footer } = Layout

export default function AppLayout({ children }) {
  const { token } = theme.useToken()

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: token.colorBgContainer,
          borderRadiusLG: token.borderRadiusLG,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Content style={{ margin: '15px 16px' }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
              }}
            >
              {children}
            </div>
          </Content>

        </Layout>
      </Layout>
    </ConfigProvider>
  )
}
