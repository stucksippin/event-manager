'use client'

import { useEffect, useState } from 'react'
import { Button, List, Modal, Form, Input, DatePicker, Typography, Space } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import useTaskStore from '../store/useTaskStore'
import dayjs from 'dayjs'

const { Title } = Typography

export default function TaskList({ calendarId, selectedDate }) {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)


  // фетч тасок
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchTasks(calendarId).finally(() => setLoading(false))
  }, [calendarId, fetchTasks])



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
        loading={loading}
        dataSource={tasks}
        locale={{ emptyText: 'Задач нет' }}
        renderItem={(task) => (
          <List.Item
            key={task.id}
            style={{ position: 'relative' }} // важное: relative для даты
            actions={[
              <EditOutlined key="edit" onClick={() => openEdit(task)} />,
              <DeleteOutlined key="del" onClick={() => deleteTask(task.id)} />
            ]}
          >
            <List.Item.Meta
              title={task.title}
              description={task.description}
            />

            {/* Дата в правом верхнем углу */}
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                right: 5,
                fontSize: 12,
                color: '#888',

              }}
            >
              {dayjs(task.date).format('D MMMM YYYY')}
            </div>
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
            date: editingTask
              ? dayjs(editingTask.date)
              : selectedDate
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
