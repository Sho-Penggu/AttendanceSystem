**1. School Attendance System**
- Attendance tracking system for students and faculty, within laboratory

**2. Features**
- Student & faculty check-in and check-out

- Attendance logs and reports

- Filter by date (daily, weekly, monthly)

- Print attendance reports (In progress)

- Attendance using Barcode Scanner (In progress)

- Laravel API backend with React frontend

**3. Tech Stack**
- Laravel 12 (Backend)

- React (Frontend)

- Inertia.js

- MySQL/PostgreSQL (Database) 

- Laragon 6.0.0

- Axios (for API requests)

**4. Installation & Setup**
- Steps to clone and run the project locally

- Laravel & React setup commands

  - git clone https://github.com/Sho-Penggu/AttendanceSystem.git
  - cd hcdc-attendance
  - composer install
  - cp .env.example .env
  - php artisan key:generate
  - npm install
  - npm run dev
  - php artisan migrate
  - php artisan serve

**5. API Endpoints**
- List of key API routes (/api/check-in, /api/check-out, /api/attendance, dashboard) (In progress)
