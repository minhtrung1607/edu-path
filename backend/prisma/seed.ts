import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Xóa data cũ
  await prisma.otp.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.knowledge.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // Tạo 5 Admins (để đủ 20 account cùng với 15 students)
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        email: `admin${i}@example.com`,
        password: defaultPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    });
  }

  // Tạo 15 Students
  for (let i = 1; i <= 15; i++) {
    await prisma.user.create({
      data: {
        email: `student${i}@example.com`,
        password: defaultPassword,
        role: 'STUDENT',
        isVerified: true,
        student: {
          create: {
            name: `Student Name ${i}`,
            skills: 'React, Node.js',
            goal: 'Become a Fullstack Developer',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 tháng sau
          },
        },
      },
    });
  }

  // Tạo 5 OTP mẫu (còn hạn 10 phút)
  for (let i = 1; i <= 5; i++) {
    await prisma.otp.create({
      data: {
        email: `test${i}@example.com`,
        otpCode: `12345${i}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
    });
  }

  // Tạo 5 Public Roadmaps
  for (let i = 1; i <= 5; i++) {
    await prisma.roadmap.create({
      data: {
        title: `Public Roadmap ${i}: Learn Next.js & Prisma`,
        description: `This is a public roadmap ${i} for everyone to view.`,
        isPublic: true,
      },
    });
  }

  // Tạo 5 Public Knowledge
  for (let i = 1; i <= 5; i++) {
    await prisma.knowledge.create({
      data: {
        title: `Public Knowledge Article ${i}`,
        content: `Content for public knowledge article ${i}. This is accessible to guests.`,
        type: 'ARTICLE',
        isPublic: true,
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
