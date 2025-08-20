Awesome—let’s lock this to **Full-Stack Next.js (App Router) + Prisma + PostgreSQL only** (no separate Express/Nest backend). Below is a **LLM-friendly PRD** you can paste into a generator.
---
# PRD — K-12 E-Learning Platform (SD/SMP/SMA)
**Stack**: Next.js (App Router, Server Actions, Route Handlers), Prisma, PostgreSQL, NextAuth, Tailwind, Uploads (S3/Supabase), Redis (optional)
## 1) Product Overview
* **Goal**: Web app for Indonesian K-12 (SD/SMP/SMA) enabling courses, lessons, quizzes/exams, assignments, grading, parent monitoring, announcements, messaging, and analytics.
* **Primary roles**: `Student`, `Teacher`, `Parent`, `Admin`.
* **Tenancy**: Single-tenant for MVP; supports multiple schools as entities.
## 2) Core User Stories (Must-Have)
1. **Student**
* Browse & enroll in courses by grade (SD/SMP/SMA).
* Consume lessons (video/pdf/text), take quizzes, submit assignments.
* View progress, grades, badges.
2. **Teacher**
* Create/manage courses by grade & subject; author lessons.
* Build quizzes/assignments/exams; auto/manual grading; feedback.
* Post announcements; manage class rosters; track performance.
3. **Parent**
* Link to child account; view progress, attendance, deadlines, grades.
* Receive notifications and message teachers.
4. **Admin**
* User & role management, course approval, content moderation.
* System analytics & configurations.
## 3) Non-Functional Requirements
* **Performance**: P95 page < 1.5s on broadband; quiz submission < 300ms server time.
* **Security**: RBAC, hashed passwords, CSRF, rate limiting on auth & messaging routes.
* **Privacy**: Student data protected; downloadable data by Admin only.
* **Accessibility**: WCAG 2.1 AA.
* **Localization**: Default Indonesian; support EN later.
* **Responsive**: Fully responsive (mobile-first).
## 4) Architecture (Next.js-Only Backend)
* **Routing**: Next.js App Router.
* **Data layer**: Prisma → PostgreSQL.
* **Auth**: NextAuth (Credentials + Google optional), Roles in JWT/session.
* **APIs**: Next.js Route Handlers (`app/api/**/route.ts`) + **Server Actions** for simple mutations.
* **Uploads**: Client → signed URL → S3/Supabase. DB stores metadata.
* **Background jobs (optional)**: Edge-friendly queue or Cron (Vercel Cron) for reminders/notifications.
* **Caching**: React Server Components caching, Revalidation, optional Redis for hot data (leaderboards, counts).
## 5) Data Model (Prisma)
> Copy-paste ready (adjust as needed)
```prisma
// schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
enum Role { STUDENT TEACHER PARENT ADMIN }
enum GradeLevel { SD1 SD2 SD3 SD4 SD5 SD6 SMP7 SMP8 SMP9 SMA10 SMA11 SMA12 }
enum ContentType { VIDEO PDF ARTICLE SLIDES LINK }
enum QuestionType { MULTIPLE_CHOICE TRUE_FALSE SHORT_ANSWER }
enum SubmissionStatus { SUBMITTED GRADED LATE MISSING }
enum EnrollmentStatus { PENDING ACTIVE DROPPED COMPLETED }
enum Visibility { DRAFT PUBLISHED ARCHIVED }
model User {
id String @id @default(cuid())
email String @unique
name String
image String?
role Role @default(STUDENT)
gradeLevel GradeLevel?
// Parent-child linking via Join table below
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
// Auth (NextAuth)
accounts Account[]
sessions Session[]
// Relations
teacherCourses Course[] @relation("CourseTeacher")
enrollments Enrollment[]
submissions Submission[]
messagesSent Message[] @relation("SentMessages")
messagesRecv Message[] @relation("RecvMessages")
notifications Notification[]
badges UserBadge[]
schools SchoolUser[]
}
model School {
id String @id @default(cuid())
name String
address String?
phone String?
visibility Visibility @default(PUBLISHED)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
courses Course[]
users SchoolUser[]
}
model SchoolUser {
id String @id @default(cuid())
schoolId String
userId String
roleAtSchool Role
school School @relation(fields: [schoolId], references: [id])
user User @relation(fields: [userId], references: [id])
@@unique([schoolId, userId])
}
model ParentChild {
id String @id @default(cuid())
parentId String
childId String
createdAt DateTime @default(now())
parent User @relation("ParentRel", fields: [parentId], references: [id])
child User @relation("ChildRel", fields: [childId], references: [id])
@@unique([parentId, childId])
}
model Course {
id String @id @default(cuid())
title String
description String?
subject String // e.g., Math, Science, Bahasa Indonesia
gradeLevel GradeLevel
schoolId String?
teacherId String
visibility Visibility @default(DRAFT)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
teacher User @relation("CourseTeacher", fields: [teacherId], references: [id])
school School? @relation(fields: [schoolId], references: [id])
lessons Lesson[]
quizzes Quiz[]
assignments Assignment[]
enrollments Enrollment[]
announcements Announcement[]
}
model Enrollment {
id String @id @default(cuid())
courseId String
studentId String
status EnrollmentStatus @default(PENDING)
createdAt DateTime @default(now())
course Course @relation(fields: [courseId], references: [id])
student User @relation(fields: [studentId], references: [id])
@@unique([courseId, studentId])
}
model Lesson {
id String @id @default(cuid())
courseId String
title String
contentType ContentType
contentUrl String? // optional for VIDEO/PDF/SLIDES/LINK
contentHtml String? // ARTICLE rich text
order Int // order within course
visibility Visibility @default(DRAFT)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
course Course @relation(fields: [courseId], references: [id])
}
model Quiz {
id String @id @default(cuid())
courseId String
title String
isExam Boolean @default(false)
timeLimit Int? // seconds
totalPoints Int @default(0)
visibility Visibility @default(DRAFT)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
course Course @relation(fields: [courseId], references: [id])
questions Question[]
attempts QuizAttempt[]
}
model Question {
id String @id @default(cuid())
quizId String
type QuestionType
prompt String
points Int @default(1)
order Int
// MCQ options
options Option[]
// Short answer correct pattern
correctText String?
quiz Quiz @relation(fields: [quizId], references: [id])
}
model Option {
id String @id @default(cuid())
questionId String
text String
isCorrect Boolean @default(false)
order Int
question Question @relation(fields: [questionId], references: [id])
}
model QuizAttempt {
id String @id @default(cuid())
quizId String
studentId String
startedAt DateTime @default(now())
submittedAt DateTime?
score Int @default(0)
quiz Quiz @relation(fields: [quizId], references: [id])
student User @relation(fields: [studentId], references: [id])
answers Answer[]
}
model Answer {
id String @id @default(cuid())
attemptId String
questionId String
selectedOptionId String?
textAnswer String?
isCorrect Boolean?
attempt QuizAttempt @relation(fields: [attemptId], references: [id])
question Question @relation(fields: [questionId], references: [id])
}
model Assignment {
id String @id @default(cuid())
courseId String
title String
description String?
dueAt DateTime?
totalPoints Int @default(100)
visibility Visibility @default(DRAFT)
createdAt DateTime @default(now())
course Course @relation(fields: [courseId], references: [id])
submissions Submission[]
}
model Submission {
id String @id @default(cuid())
assignmentId String
studentId String
fileUrl String?
textAnswer String?
submittedAt DateTime?
status SubmissionStatus @default(MISSING)
score Int?
feedback String?
assignment Assignment @relation(fields: [assignmentId], references: [id])
student User @relation(fields: [studentId], references: [id])
}
model Announcement {
id String @id @default(cuid())
courseId String
title String
body String
createdAt DateTime @default(now())
course Course @relation(fields: [courseId], references: [id])
}
model Message {
id String @id @default(cuid())
fromId String
toId String
body String
createdAt DateTime @default(now())
from User @relation("SentMessages", fields: [fromId], references: [id])
to User @relation("RecvMessages", fields: [toId], references: [id])
}
model Notification {
id String @id @default(cuid())
userId String
title String
body String?
readAt DateTime?
createdAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
}
model Badge {
id String @id @default(cuid())
code String @unique
name String
criteria String?
iconUrl String?
createdAt DateTime @default(now())
users UserBadge[]
}
model UserBadge {
id String @id @default(cuid())
userId String
badgeId String
awardedAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
badge Badge @relation(fields: [badgeId], references: [id])
@@unique([userId, badgeId])
}
// NextAuth models (standard)
model Account {
id String @id @default(cuid())
userId String
type String
provider String
providerAccountId String
refresh_token String? @db.Text
access_token String? @db.Text
expires_at Int?
token_type String?
scope String?
id_token String? @db.Text
session_state String?
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
@@unique([provider, providerAccountId])
}
model Session {
id String @id @default(cuid())
sessionToken String @unique
userId String
expires DateTime
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
model VerificationToken {
identifier String
token String @unique
expires DateTime
@@unique([identifier, token])
}
```
## 6) RBAC (Route-Level Permissions)
* **Admin**: full CRUD on users/courses; approve publish; view analytics.
* **Teacher**: CRUD own courses/lessons/quizzes/assignments; grade; view own analytics.
* **Student**: enroll, read published content, attempt quizzes, submit assignments; read own grades.
* **Parent**: read child’s courses/grades/announcements; message teachers.
* **Unauthenticated**: marketing pages, sign in/up, limited catalog preview.
## 7) Route Map (Next.js App Router)
```
/ (Marketing/Landing)
/auth/signin
/auth/signup
/dashboard (role-aware)
/courses (list + filters: subject, gradeLevel)
/courses/[courseId] (overview, syllabus, announcements)
/courses/[courseId]/lessons/[lessonId]
/courses/[courseId]/quizzes/[quizId]
/courses/[courseId]/assignments/[assignmentId]
/messages (inbox, thread)
/notifications
/parent/children (link children, overview)
/teacher/courses (my courses)
/teacher/courses/new
/teacher/courses/[id]/edit
/teacher/courses/[id]/people (roster)
/teacher/courses/[id]/gradebook
/admin/users
/admin/courses (approval queue)
/admin/analytics
```
### API (Route Handlers) — examples
```
POST /api/auth/[...nextauth]
GET /api/courses?gradeLevel=SMP7&subject=Math
POST /api/courses (Teacher)
PATCH /api/courses/:id (Teacher/Admin)
POST /api/courses/:id/publish (Teacher→Admin approval or direct if policy)
POST /api/lessons (Teacher)
POST /api/quizzes (Teacher)
POST /api/quizzes/:id/attempts (Student)
POST /api/assignments/:id/submissions (Student)
POST /api/messages (auth users)
GET /api/parent/children (Parent)
POST /api/parent/children/link (Parent)
GET /api/admin/analytics (Admin)
```
> Prefer **Server Actions** for simple mutations from RSC (e.g., create course/lesson) with Zod validation. Use Route Handlers for programmatic/3rd-party access and complex flows (uploads, signed URLs).
## 8) Validation & Business Rules
* `Course.visibility=PUBLISHED` → only then visible for enrollments.
* `Lesson.visibility=PUBLISHED` → visible to **enrolled** students.
* `Enrollment` requires `User.role=STUDENT`.
* `ParentChild` requires `parent.role=PARENT` and `child.role=STUDENT`.
* Quiz attempt:
* 1 in-progress attempt per student per quiz; respect `timeLimit`.
* Auto-grade MCQ/True-False; manual grade for short answers.
* Assignment submission:
* `status=LATE` if submitted after `dueAt`.
* Teacher can override score and add feedback.
## 9) Analytics (MVP)
* Student: completion %, avg quiz score, overdue items count.
* Teacher: per-course completion funnel, average grade distribution, engagement (lesson view counts).
* Admin: #active users by role, #published courses per grade, weekly DAU/WAU.
## 10) Notifications (MVP)
* In-app for: new announcement, graded submission, upcoming due date (24h).
* Optional email (via NextAuth email provider or transactional service).
* Use scheduled route or Vercel Cron to send reminders daily 07:00 WIB.
## 11) Acceptance Criteria (Samples)
* A teacher can create a course, add 3 lessons, publish, and invite students. Students can enroll and see content.
* A student can complete a quiz with MCQ and get immediate score; teacher sees attempt and score.
* A parent can link to a child and see grades & deadlines.
* Admin can revoke a course to `ARCHIVED` and it disappears from catalog.
## 12) Testing Strategy
* **Unit**: Zod schemas, grading logic, RBAC guards.
* **Integration**: Route Handlers (POST /quizzes/\:id/attempts), Server Actions for course creation.
* **E2E**: Playwright — teacher creates course → student enrolls → completes quiz → parent views dashboard.
## 13) Seed Data (for demos)
* Schools: “SD Nusantara”, “SMP Harapan”, “SMA Cendekia”.
* Users: 2 teachers/grade, 10 students/grade, 3 parents linked.
* Courses per grade: Math, Science, Bahasa Indonesia.
* Each course: 3 lessons (1 ARTICLE, 1 VIDEO, 1 PDF), 1 quiz (5 MCQs), 1 assignment.
## 14) Environment & Config
```
DATABASE_URL=postgres://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=... # optional
GOOGLE_CLIENT_SECRET=...
STORAGE_BUCKET=...
STORAGE_REGION=...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
REDIS_URL=... # optional
```
## 15) Suggested Folder Structure
```
/app
/(marketing)
/dashboard
/courses
/teacher
/parent
/admin
/api
/lib
/auth (nextauth.ts)
/db (prisma.ts)
/rbac (guards.ts)
/upload (signed-url.ts)
/components
ui/* (shadcn or custom)
course/*
/styles
/prisma
schema.prisma
seed.ts
```
## 16) UI/UX Notes
* Use **role-aware dashboards**.
* Clear grade filters (SD/SMP/SMA + class levels).
* Progress bars and badges for motivation.
* Teacher gradebook with inline edit.
* Parent cards: child overview + quick alerts.
## 17) Roadmap (Post-MVP)
* Live classes (LiveKit), AI tutor (RAG over curriculum), certificates, payments (Midtrans/Xendit), mobile PWA features.
---
### Developer Notes (LLM-Execution Hints)
* Prefer **Server Actions** for create/update where CSRF is handled by RSC.
* All mutations must check **RBAC guard**: `assertRole(user, [...])`.
* Use **Zod** for payload validation.
* File uploads: `POST /api/uploads/signed-url` → client PUT → store metadata.
* Use `revalidatePath('/courses/[id]')` after publishing to update catalog.