// app/layout.js
import './globals.css'
import '@ant-design/v5-patch-for-react-19'
import RootClientLayout from './RootClientLayout'

export const metadata = {
  title: 'Your App',
  description: '…',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  )
}