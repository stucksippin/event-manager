"use client"
import React, { useState } from "react"
import { Modal, Button, Input, message } from "antd"
import { useRouter } from "next/navigation"

export default function InviteModal({ calendarId }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()

  const sendInvite = async () => {
    try {
      const res = await fetch("/api/invitations/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId, inviteeEmail: email })
      })
      if (!res.ok) throw new Error()
      message.success("Приглашение отправлено")
      setOpen(false)
    } catch {
      message.error("Не удалось отправить приглашение")
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} type="dashed">
        Пригласить пользователя
      </Button>
      <Modal
        title="Пригласить пользователя"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={sendInvite}
        okText="Отправить"
        cancelText="Отмена"
      >
        <Input
          placeholder="Email пользователя"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Modal>
    </>
  )
}