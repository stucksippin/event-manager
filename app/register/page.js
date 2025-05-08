'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Alert } from 'antd'

export default function RegisterPage() {
  const [error, setError] = useState(null)
  const router = useRouter()

  const onFinish = async ({ name, email, password }) => {
    setError(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error)
    } else {
      router.push('/login')
    }
  }


  return (
    <div className="flex items-center justify-center h-screen">

      <Form
        name="register"
        layout="vertical"
        style={{ width: 300 }}
        onFinish={onFinish}
      >
        <Form.Item name="name" label="Имя">
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Введите email' }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Пароль"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password />
        </Form.Item>
        {error && <Alert type="error" message={error} />}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Зарегистрироваться
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="link" onClick={() => router.push('/login')}>
            Уже есть аккаунт? Войти
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}