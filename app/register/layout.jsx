import './auth.css'

export const metadata = {
  title: 'Регистрация в приложении',
}

export default function RegisterLayout({ children }) {
  return (
    <div className="auth-container">
      {children}
    </div>
  )
}