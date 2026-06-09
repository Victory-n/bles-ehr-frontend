import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
let prismaInstance: PrismaClient;

function getPrisma(): PrismaClient {
  if (typeof window !== 'undefined') {
    return null as unknown as PrismaClient
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables')
    }
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    prismaInstance = new PrismaClient({
      adapter,
      log: ['query'],
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance
    }
  }

  return prismaInstance
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma()
    if (instance === null) {
      return undefined
    }
    const value = Reflect.get(instance, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})
