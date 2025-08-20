import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create schools
  const schools = await Promise.all([
    prisma.school.create({
      data: {
        name: 'SDN 1 Jakarta',
        address: 'Jl. Pendidikan No. 1, Jakarta',
        phone: '021-123456',
        email: 'sdn1@jakarta.sch.id',
        type: 'SD',
        isActive: true
      }
    }),
    prisma.school.create({
      data: {
        name: 'SMPN 2 Jakarta',
        address: 'Jl. Pelajar No. 2, Jakarta',
        phone: '021-234567',
        email: 'smpn2@jakarta.sch.id',
        type: 'SMP',
        isActive: true
      }
    }),
    prisma.school.create({
      data: {
        name: 'SMAN 3 Jakarta',
        address: 'Jl. Siswa No. 3, Jakarta',
        phone: '021-345678',
        email: 'sman3@jakarta.sch.id',
        type: 'SMA',
        isActive: true
      }
    })
  ])

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin System',
      email: 'admin@elearning.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  })

  // Teachers
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Budi Santoso',
        email: 'budi@elearning.com',
        password: hashedPassword,
        role: 'TEACHER',
        school: 'SDN 1 Jakarta',
        grade: 'Guru Kelas 6',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Siti Aminah',
        email: 'siti@elearning.com',
        password: hashedPassword,
        role: 'TEACHER',
        school: 'SMPN 2 Jakarta',
        grade: 'Guru Matematika',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ahmad Dahlan',
        email: 'ahmad@elearning.com',
        password: hashedPassword,
        role: 'TEACHER',
        school: 'SMAN 3 Jakarta',
        grade: 'Guru IPA',
        isActive: true
      }
    })
  ])

  // Students
  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ahmad Rizki',
        email: 'ahmad.rizki@elearning.com',
        password: hashedPassword,
        role: 'STUDENT',
        school: 'SDN 1 Jakarta',
        grade: 'Kelas 6',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@elearning.com',
        password: hashedPassword,
        role: 'STUDENT',
        school: 'SDN 1 Jakarta',
        grade: 'Kelas 5',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Budi Cahyono',
        email: 'budi.cahyono@elearning.com',
        password: hashedPassword,
        role: 'STUDENT',
        school: 'SMPN 2 Jakarta',
        grade: 'Kelas 7',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Dewi Lestari',
        email: 'dewi.lestari@elearning.com',
        password: hashedPassword,
        role: 'STUDENT',
        school: 'SMPN 2 Jakarta',
        grade: 'Kelas 8',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Eko Prasetyo',
        email: 'eko.prasetyo@elearning.com',
        password: hashedPassword,
        role: 'STUDENT',
        school: 'SMAN 3 Jakarta',
        grade: 'Kelas 10',
        isActive: true
      }
    })
  ])

  // Parents
  const parents = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rizki Ahmad',
        email: 'rizki.ahmad@elearning.com',
        password: hashedPassword,
        role: 'PARENT',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Nurhaliza Siti',
        email: 'nurhaliza.siti@elearning.com',
        password: hashedPassword,
        role: 'PARENT',
        isActive: true
      }
    })
  ])

  // Create parent-child relationships
  await Promise.all([
    prisma.parentChild.create({
      data: {
        parentId: parents[0].id,
        childId: students[0].id
      }
    }),
    prisma.parentChild.create({
      data: {
        parentId: parents[1].id,
        childId: students[1].id
      }
    })
  ])

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        id: 'cmejll4ky000jf9r4p8n5jcyg',
        title: 'Matematika Kelas 6 SD',
        description: 'Pelajaran matematika untuk kelas 6 SD',
        subject: 'Matematika',
        gradeLevel: 'SD6',
        teacherId: teachers[0].id,
        schoolId: schools[0].id,
        visibility: 'PUBLISHED'
      }
    }),
    prisma.course.create({
      data: {
        title: 'Bahasa Indonesia Kelas 6 SD',
        description: 'Pelajaran bahasa Indonesia untuk kelas 6 SD',
        subject: 'Bahasa Indonesia',
        gradeLevel: 'SD6',
        teacherId: teachers[0].id,
        schoolId: schools[0].id,
        visibility: 'PUBLISHED'
      }
    }),
    prisma.course.create({
      data: {
        title: 'Matematika Kelas 7 SMP',
        description: 'Pelajaran matematika untuk kelas 7 SMP',
        subject: 'Matematika',
        gradeLevel: 'SMP7',
        teacherId: teachers[1].id,
        schoolId: schools[1].id,
        visibility: 'PUBLISHED'
      }
    }),
    prisma.course.create({
      data: {
        title: 'IPA Kelas 10 SMA',
        description: 'Pelajaran IPA untuk kelas 10 SMA',
        subject: 'IPA',
        gradeLevel: 'SMA10',
        teacherId: teachers[2].id,
        schoolId: schools[2].id,
        visibility: 'PUBLISHED'
      }
    })
  ])

  // Create lessons
  const lessons = await Promise.all([
    // Lessons for Matematika Kelas 6 SD
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: 'Pengenalan Bilangan Bulat',
        contentType: 'ARTICLE',
        contentHtml: '<h1>Pengenalan Bilangan Bulat</h1><p>Bilangan bulat adalah bilangan yang tidak memiliki pecahan...</p>',
        order: 1,
        visibility: 'PUBLISHED'
      }
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: 'Operasi Penjumlahan',
        contentType: 'VIDEO',
        contentUrl: '/videos/penjumlahan.mp4',
        order: 2,
        visibility: 'PUBLISHED'
      }
    }),
    // Lessons for Matematika Kelas 7 SMP
    prisma.lesson.create({
      data: {
        courseId: courses[2].id,
        title: 'Aljabar Dasar',
        contentType: 'ARTICLE',
        contentHtml: '<h1>Aljabar Dasar</h1><p>Aljabar adalah cabang matematika yang menggunakan simbol...</p>',
        order: 1,
        visibility: 'PUBLISHED'
      }
    })
  ])

  // Create quizzes
  const quizzes = await Promise.all([
    prisma.quiz.create({
      data: {
        courseId: courses[0].id,
        title: 'Kuis Bilangan Bulat',
        isExam: false,
        timeLimit: 1800, // 30 minutes
        totalPoints: 100,
        visibility: 'PUBLISHED'
      }
    }),
    prisma.quiz.create({
      data: {
        courseId: courses[2].id,
        title: 'Kuis Aljabar Dasar',
        isExam: false,
        timeLimit: 2400, // 40 minutes
        totalPoints: 100,
        visibility: 'PUBLISHED'
      }
    })
  ])

  // Create questions
  const questions = await Promise.all([
    // Questions for Bilangan Bulat quiz
    prisma.question.create({
      data: {
        quizId: quizzes[0].id,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Hasil dari 15 + 25 adalah...',
        points: 20,
        order: 1,
        options: {
          create: [
            { text: '35', isCorrect: false, order: 1 },
            { text: '40', isCorrect: true, order: 2 },
            { text: '45', isCorrect: false, order: 3 },
            { text: '50', isCorrect: false, order: 4 }
          ]
        }
      }
    }),
    prisma.question.create({
      data: {
        quizId: quizzes[0].id,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Bilangan negatif terbesar adalah...',
        points: 20,
        order: 2,
        options: {
          create: [
            { text: '-1', isCorrect: true, order: 1 },
            { text: '-10', isCorrect: false, order: 2 },
            { text: '-100', isCorrect: false, order: 3 },
            { text: '-1000', isCorrect: false, order: 4 }
          ]
        }
      }
    })
  ])

  // Create assignments
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        courseId: courses[0].id,
        title: 'Tugas Operasi Hitung',
        description: 'Kerjakan soal-soal operasi hitung bilangan bulat',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalPoints: 100,
        visibility: 'PUBLISHED'
      }
    }),
    prisma.assignment.create({
      data: {
        courseId: courses[2].id,
        title: 'Tugas Persamaan Linear',
        description: 'Selesaikan persamaan linear satu variabel',
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        totalPoints: 100,
        visibility: 'PUBLISHED'
      }
    })
  ])

  // Create enrollments
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        courseId: courses[0].id,
        studentId: students[0].id,
        status: 'ACTIVE',
        progress: 75
      }
    }),
    prisma.enrollment.create({
      data: {
        courseId: courses[1].id,
        studentId: students[0].id,
        status: 'ACTIVE',
        progress: 60
      }
    }),
    prisma.enrollment.create({
      data: {
        courseId: courses[2].id,
        studentId: students[2].id,
        status: 'ACTIVE',
        progress: 45
      }
    }),
    prisma.enrollment.create({
      data: {
        courseId: courses[3].id,
        studentId: students[4].id,
        status: 'ACTIVE',
        progress: 30
      }
    })
  ])

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        code: 'FIRST_COURSE',
        name: 'Pemula',
        criteria: 'Selesaikan 1 kursus'
      }
    }),
    prisma.badge.create({
      data: {
        code: 'QUIZ_MASTER',
        name: 'Master Kuis',
        criteria: 'Dapatkan nilai 100 pada kuis'
      }
    }),
    prisma.badge.create({
      data: {
        code: 'STREAK_7',
        name: 'Semangat 7 Hari',
        criteria: 'Belajar 7 hari berturut-turut'
      }
    }),
    prisma.badge.create({
      data: {
        code: 'FAST_LEARNER',
        name: 'Pembelajar Cepat',
        criteria: 'Selesaikan kursus dalam 3 hari'
      }
    })
  ])

  // Award some badges to students
  await Promise.all([
    prisma.userBadge.create({
      data: {
        userId: students[0].id,
        badgeId: badges[0].id
      }
    }),
    prisma.userBadge.create({
      data: {
        userId: students[2].id,
        badgeId: badges[1].id
      }
    })
  ])

  // Create some messages
  await Promise.all([
    prisma.message.create({
      data: {
        fromId: teachers[0].id,
        toId: students[0].id,
        body: 'Selamat datang di kelas matematika!'
      }
    }),
    prisma.message.create({
      data: {
        fromId: students[0].id,
        toId: teachers[0].id,
        body: 'Terima kasih pak, saya siap belajar.'
      }
    }),
    prisma.message.create({
      data: {
        fromId: parents[0].id,
        toId: teachers[0].id,
        body: 'Selamat pagi pak, bagaimana progress anak saya?'
      }
    })
  ])

  // Create some notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: students[0].id,
        title: 'Tugas Baru',
        body: 'Tugas Operasi Hitung telah ditambahkan'
      }
    }),
    prisma.notification.create({
      data: {
        userId: students[0].id,
        title: 'Kuis Mendatang',
        body: 'Kuis Bilangan Bulat akan dimulai besok'
      }
    }),
    prisma.notification.create({
      data: {
        userId: teachers[0].id,
        title: 'Pengumpulan Tugas',
        body: '5 siswa telah mengumpulkan tugas'
      }
    })
  ])

  console.log('Database seeded successfully!')
  console.log('Login credentials:')
  console.log('Admin: admin@elearning.com / password123')
  console.log('Teacher: budi@elearning.com / password123')
  console.log('Student: ahmad.rizki@elearning.com / password123')
  console.log('Parent: rizki.ahmad@elearning.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })