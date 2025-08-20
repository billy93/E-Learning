# Seed Data untuk Demo

File ini berisi data contoh untuk keperluan demo platform E-Learning.

## Cara Menggunakan Seed Data

### 1. Reset Database (Opsional)
Jika ingin menghapus semua data yang ada:
```bash
npm run db:reset
```

### 2. Jalankan Seed Data
```bash
npm run db:seed
```

### 3. Atau Jalankan Sekaligus
```bash
npm run db:reset && npm run db:seed
```

## Data yang Dibuat

### Schools
- SDN 1 Jakarta (SD)
- SMPN 2 Jakarta (SMP) 
- SMAN 3 Jakarta (SMA)

### Users
#### Admin
- Email: admin@elearning.com
- Password: password123
- Role: ADMIN

#### Teachers
- Budi Santoso (budi@elearning.com) - Guru SDN 1 Jakarta
- Siti Aminah (siti@elearning.com) - Guru SMPN 2 Jakarta
- Ahmad Dahlan (ahmad@elearning.com) - Guru SMAN 3 Jakarta
- Password: password123 untuk semua guru

#### Students
- Ahmad Rizki (ahmad.rizki@elearning.com) - Siswa SDN 1 Jakarta Kelas 6
- Siti Nurhaliza (siti.nurhaliza@elearning.com) - Siswa SDN 1 Jakarta Kelas 5
- Budi Cahyono (budi.cahyono@elearning.com) - Siswa SMPN 2 Jakarta Kelas 7
- Dewi Lestari (dewi.lestari@elearning.com) - Siswa SMPN 2 Jakarta Kelas 8
- Eko Prasetyo (eko.prasetyo@elearning.com) - Siswa SMAN 3 Jakarta Kelas 10
- Password: password123 untuk semua siswa

#### Parents
- Rizki Ahmad (rizki.ahmad@elearning.com) - Orang tua Ahmad Rizki
- Nurhaliza Siti (nurhaliza.siti@elearning.com) - Orang tua Siti Nurhaliza
- Password: password123 untuk semua orang tua

### Courses
- Matematika Kelas 6 SD (oleh Budi Santoso)
- Bahasa Indonesia Kelas 6 SD (oleh Budi Santoso)
- Matematika Kelas 7 SMP (oleh Siti Aminah)
- IPA Kelas 10 SMA (oleh Ahmad Dahlan)

### Lessons & Content
- Pengenalan Bilangan Bulat (Matematika SD)
- Operasi Penjumlahan (Matematika SD)
- Aljabar Dasar (Matematika SMP)

### Quizzes & Questions
- Kuis Bilangan Bulat dengan 2 pertanyaan pilihan ganda
- Kuis Aljabar Dasar

### Assignments
- Tugas Operasi Hitung (Matematika SD)
- Tugas Persamaan Linear (Matematika SMP)

### Enrollments
- Ahmad Rizki terdaftar di 2 kursus SD (progress 75% dan 60%)
- Budi Cahyono terdaftar di kursus SMP (progress 45%)
- Eko Prasetyo terdaftar di kursus SMA (progress 30%)

### Badges
- Pemula: Menyelesaikan kursus pertama
- Master Kuis: Mendapatkan nilai sempurna pada kuis
- Semangat 7 Hari: Belajar selama 7 hari berturut-turut
- Pembelajar Cepat: Menyelesaikan kursus dalam waktu singkat

### Messages & Notifications
- Contoh pesan antara guru-siswa dan orang tua-guru
- Contoh notifikasi untuk tugas dan kuis

## Testing Scenarios

### 1. Admin Dashboard
- Login sebagai admin
- Akses `/admin` untuk melihat dashboard admin
- Cek user management, courses, schools, dan analytics

### 2. Teacher Dashboard
- Login sebagai guru (budi@elearning.com)
- Akses `/teacher/courses` untuk mengelola kursus
- Buat lesson, quiz, atau assignment baru

### 3. Student Learning
- Login sebagai siswa (ahmad.rizki@elearning.com)
- Akses `/courses` untuk melihat kursus yang diikuti
- Kerjakan quiz dan assignment
- Lihat progress di `/progress`

### 4. Parent Monitoring
- Login sebagai orang tua (rizki.ahmad@elearning.com)
- Akses `/parent` untuk memantau progress anak
- Lihat detail progress anak di `/parent/children/[childId]`

### 5. Messaging
- Test kirim pesan antara user
- Akses `/messages` untuk melihat interface messaging
- Cek notifikasi di `/notifications`

## Catatan
- Password untuk semua user demo adalah `password123`
- Data ini hanya untuk keperluan development dan demo
- Production environment harus menggunakan data yang berbeda dan password yang lebih kuat