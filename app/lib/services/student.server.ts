import type { Student } from "~/type.d"
import { prisma } from "../db.server"

export async function getStudentDBByEmail(email: string) {
  // find student in prisma db with student email even if user is parent
  const studentPrisma = await prisma.student.findUnique({
    where: {
      email,
    },
    include: {
      users: true,
    },
  })
  return studentPrisma
}

export async function upsertStudentDB(
  student: Student,
  userId: number,
  expiry: Date,
): Promise<{
  gakuseki: number
  gakunen: string
  hr: string
  hrNo: number
  last: string
  first: string
  sei: string
  mei: string
  email: string
  folderLink: string | null
  createdAt: Date
  expiry: Date
}> {
  console.log("✅ in createStudentDB before upsert")
  return await prisma.student.upsert({
    where: {
      gakuseki: student.gakuseki,
    },
    update: {
      users: {
        connect: {
          id: userId,
        },
      },
    },
    create: {
      gakuseki: student.gakuseki,
      gakunen: student.gakunen,
      hr: student.hr,
      hrNo: student.hrNo,
      last: student.last,
      first: student.first,
      sei: student.sei || "",
      mei: student.mei || "",
      email: student.email,
      folderLink: student.folderLink,
      expiry: expiry,
      users: {
        connect: {
          id: userId,
        },
      },
    },
  })
  // return await prisma.student.create({
  //   data: {
  //     gakuseki: student.gakuseki,
  //     gakunen: student.gakunen,
  //     hr: student.hr,
  //     hrNo: student.hrNo,
  //     last: student.last,
  //     first: student.first,
  //     sei: student.sei || "",
  //     mei: student.mei || "",
  //     email: student.email,
  //     folderLink: student.folderLink,
  //     expiry: expiry,
  //     users: {
  //       connect: {
  //         id: userId,
  //       },
  //     },
  //   },
  // })
}

export async function updateStudentDB(userId: number, gakuseki: number) {
  await prisma.student.update({
    where: {
      gakuseki: gakuseki,
    },
    data: {
      users: {
        connect: {
          id: userId,
        },
      },
    },
  })
}

/*


  // if no student in db, create in prisma db
  if (!studentPrisma) {
    const student = await getStudentByEmail(studentEmail)
    logger.debug(`✅ in !studentPrisma`)
    if (student) {
      await prisma.student.create({
        data: {
          gakuseki: student.gakuseki,
          gakunen: student.gakunen,
          hr: student.hr,
          hrNo: student.hrNo,
          last: student.last,
          first: student.first,
          sei: student.sei || "",
          mei: student.mei || "",
          email: student.email,
          folderLink: student.folderLink,
          expiry: EXPIRY_DATE,
          users: {
            connect: {
              id: userPrisma.id,
            },
          },
        },
      })
    }
  } else {
    logger.debug(`✅ in else studentPrisma`)
    // if there is student in db, and user's id is not in student.users,
    // create student abd relation to user
    const userIds = studentPrisma.users.map((u) => u.id)
    if (!userIds.includes(userPrisma.id) && userPrisma.studentGakuseki) {
      await prisma.student.update({
        where: {
          gakuseki: userPrisma.studentGakuseki,
        },
        data: {
          users: {
            connect: {
              id: userPrisma.id,
            },
          },
        },
      })
    }
  }

*/
