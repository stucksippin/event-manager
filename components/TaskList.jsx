'use client'

import { useEffect, useState } from 'react'
import { Button, List, Modal, Form, Input, DatePicker, Typography, Space } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import useTaskStore from '../store/useTaskStore'
import dayjs from 'dayjs'

const { Title } = Typography

export default function TaskList({ calendarId }) {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchTasks(calendarId)
  }, [calendarId, fetchTasks])

  const openCreate = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }
  const openEdit = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const onFinish = ({ title, description, date }) => {
    const iso = dayjs(date).toISOString()
    if (editingTask) {
      updateTask({ id: editingTask.id, title, description, date: iso })
    } else {
      addTask({ calendarId, title, description, date: iso })
    }
    closeModal()
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4}>Задачи</Title>
        <Button icon={<PlusOutlined />} type="primary" onClick={openCreate}>
          Новая задача
        </Button>
      </Space>

      <List
        bordered
        dataSource={tasks}
        locale={{ emptyText: 'Задач нет' }}
        renderItem={(task) => (
          <List.Item
            actions={[
              <EditOutlined key="edit" onClick={() => openEdit(task)} />,
              <DeleteOutlined key="del" onClick={() => deleteTask(task.id)} />
            ]}
          >
            <List.Item.Meta
              title={task.title}
              description={dayjs(task.date).format('YYYY-MM-DD HH:mm')}
            />
            {task.description}
          </List.Item>
        )}
      />

      <Modal
        title={editingTask ? 'Редактировать задачу' : 'Новая задача'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            title: editingTask?.title,
            description: editingTask?.description,
            date: editingTask ? dayjs(editingTask.date) : null
          }}
        >
          <Form.Item name="title" label="Заголовок" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="date" label="Дата и время" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
