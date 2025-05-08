'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Alert } from 'antd'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // получаем код ошибки из URL: ?error=CredentialsSignin
  const errorCode = searchParams.get('error')

  // сюда мапим все коды next-auth → ваши сообщения
  const errorMessages = {
    CredentialsSignin: 'Неверный логин или пароль',
    // при необходимости можно добавить еще...
  }

  // просто храните строку или null, без аннотаций
  const [errorMessage, setErrorMessage] = useState(null)

  // если в URL есть ?error=..., сразу ставим сообщение
  useEffect(() => {
    if (errorCode) {
      setErrorMessage(errorMessages[errorCode] || 'Неизвестная ошибка')
    }
  }, [errorCode])

  const onFinish = async ({ email, password }) => {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    })
    if (res?.error) {
      setErrorMessage(errorMessages[res.error] || 'Неизвестная ошибка')
    } else {
      router.push(res.url || '/')
    }
  }

  return (
    <div className="auth-container">

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={errorMessage}
        />
      )}

      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="E-mail"
          name="email"
          rules={[
            { required: true, message: 'Пожалуйста, введите e-mail' },
            { type: 'email', message: 'Некорректный формат e-mail' },
          ]}
        >
          <Input placeholder="user@example.com" />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Войти
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" block onClick={() => router.push('/register')}>
            Ещё нет аккаунта? Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
