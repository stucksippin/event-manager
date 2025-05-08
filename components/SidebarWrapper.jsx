'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function SidebarWrapper() {
  const path = usePathname()

  // Не показываем сайдбар на экранах /login и /register
  if (path.startsWith('/login') || path.startsWith('/register')) {
    return null
  }
  return <Sidebar />
}