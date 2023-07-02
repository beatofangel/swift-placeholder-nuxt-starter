import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient
export const usePrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}
