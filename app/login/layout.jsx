import './auth.css'           // ваши стили центрирования
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'

export const metadata = {
  title: 'Вход в приложение',
}

export default function AuthLayout({ children }) {
  return (
    <ConfigProvider locale={ruRU}>
      <div className="auth-wrapper">
        {children}
      </div>
    </ConfigProvider>
  )
}
