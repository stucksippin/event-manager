'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Alert } from 'antd'

export default function LoginPageInner() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const errorCode = searchParams.get('error')

    const errorMessages = {
        CredentialsSignin: 'Неверный логин или пароль',
    }

    const [errorMessage, setErrorMessage] = useState < string | null > (null)

    useEffect(() => {
        if (errorCode) {
            setErrorMessage(errorMessages[errorCode] || 'Неизвестная ошибка')
        }
    }, [errorCode])

    const onFinish = async ({ email, password }) => {
        try {
            console.log("🔑 Попытка входа:", { email, password }) // логируем данные (пароль лучше только локально!)

            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl: '/',
            })

            console.log("📡 Ответ от signIn:", res)

            if (!res) {
                console.error("❌ signIn вернул null/undefined")
                setErrorMessage('Не удалось выполнить вход: пустой ответ')
                return
            }

            if (res.error) {
                console.error("⚠️ Ошибка входа:", res.error)
                setErrorMessage(errorMessages[res.error] || `Неизвестная ошибка: ${res.error}`)
                return
            }

            if (res.ok && res.url) {
                console.log("✅ Вход успешен, редирект на:", res.url)
                router.push(res.url)
                return
            }

            console.warn("❓ Неожиданный формат ответа:", res)
            setErrorMessage('Неожиданный ответ сервера')
        } catch (err) {
            console.error("💥 Ошибка при выполнении signIn:", err)
            setErrorMessage('Произошла внутренняя ошибка')
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
