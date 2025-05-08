// libs/prisma.ts

import { PrismaClient } from '@prisma/client'

// Добавляем типизацию к globalThis
const globalForPrisma = globalThis as {
  prisma?: PrismaClient
}

// Используем существующий клиент или создаём новый
const prisma = globalForPrisma.prisma ?? new PrismaClient()

// В dev-режиме сохраняем клиента в globalThis, чтобы избежать множественных экземпляров
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
