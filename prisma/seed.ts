import type { Role } from "@prisma/client"
import { prisma } from "../app/lib/services/db.server"
import credentials from "../data/Credential.json"
import stats from "../data/Stats.json"
import students from "../data/Student.json"
import users from "../data/User.json"

async function main() {
  await prisma.user.deleteMany()
  await prisma.student.deleteMany()
  await prisma.credential.deleteMany()
  await prisma.stats.deleteMany()

  await prisma.$queryRaw`TRUNCATE "User" RESTART IDENTITY CASCADE;`

  console.log("Deleted all data")

  console.log("Start seeding ...")
  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: {
        last: user.last,
        first: user.first,
        email: user.email,
        picture: user.picture,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        activated: user.activated,
        role: user.role as Role,
        oldId: user.id,
      },
    })
  }

  console.log(`Created ${users.length} users`)

  for (const student of students) {
    const u = await prisma.user.findUnique({
      where: {
        email: student.email,
      },
    })
    if (!u) continue
    await prisma.student.upsert({
      where: {
        gakuseki: student.gakuseki,
      },
      update: {},
      create: {
        gakuseki: student.gakuseki,
        gakunen: student.gakunen,
        hr: student.hr,
        hrNo: student.hrNo,
        last: student.last,
        first: student.first,
        sei: student.sei,
        mei: student.mei,
        email: student.email,
        folderLink: student.folderLink,
        createdAt: new Date(student.createdAt),
        expiry: new Date(student.expiry),
        users: {
          connect: {
            id: u.id,
          },
        },
      },
    })
  }

  console.log(`Created ${students.length} students`)

  for (const cred of credentials) {
    const u = await prisma.user.findUnique({
      where: {
        oldId: cred.userId,
      },
    })
    if (!u) continue

    await prisma.credential.upsert({
      where: {
        userId: u.id,
      },
      update: {},
      create: {
        accessToken: cred.accessToken,
        scope: cred.scope,
        tokenType: cred.tokenType,
        expiry: new Date(cred.expiry),
        refreshToken: null,
        refreshTokenExpiry: new Date(),
        createdAt: new Date(),
        user: {
          connect: {
            id: u.id,
          },
        },
      },
    })
  }

  console.log(`Created ${credentials.length} credentials`)

  for (const stat of stats) {
    const u = await prisma.user.findUnique({
      where: {
        oldId: stat.userId,
      },
    })
    if (!u) continue
    await prisma.stats.upsert({
      where: {
        userId: u.id,
      },
      update: {},
      create: {
        count: stat.count,
        lastVisited: new Date(stat.lastVisited),
        user: {
          connect: {
            id: u.id,
          },
        },
      },
    })
  }

  console.log(`Created ${stats.length} stats`)

  console.log("Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
