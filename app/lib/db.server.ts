import { PrismaClient } from "@prisma/client"
import os from "os"
import { logger } from "./logger"
const cpuCount = os.cpus().length

logger.info(`🐳 CPU count: ${cpuCount}`)

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["info"],
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
