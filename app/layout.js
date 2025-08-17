// app/layout.js
import './globals.css'
import '@ant-design/v5-patch-for-react-19'
import RootClientLayout from './RootClientLayout'
import { Suspense } from 'react'

export const metadata = {
  title: 'Your App',
  description: '…',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RootClientLayout>
          <Suspense fallback={<div style={{ padding: 24 }}>Загрузка...</div>}>
            {children}
          </Suspense>
        </RootClientLayout>
      </body>
    </html>
  )
}
