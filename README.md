# Perfomate — Caliph Life School

A tracking system for Caliph Life School built with React + Vite.

## How to Run

### Option 1 — Open in Antigravity
Just drag and drop this folder into Antigravity and it will run automatically.

### Option 2 — Run Locally
1. Make sure Node.js is installed on your computer
2. Open terminal in this folder
3. Run: npm install
4. Run: npm run dev
5. Open browser at http://localhost:5173

### Option 3 — Upload to Bolt.new or Lovable
Upload the whole folder or paste the contents of src/App.jsx

## Login Details
- Admin: admin@gmail.com / perfomate@123
- Mentor (test): ali@school.com / any password

## Connect Supabase
In src/App.jsx, search for "TODO: SUPABASE" to find all
the places where real database calls should be added.

Replace mock data with your Supabase URL and anon key:
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

## Modules
- Students (class-wise with profiles)
- Tally & Stars (points + leaderboard)
- Morning Bliss (calendar + presenter)
- Prayer Attendance (5 prayers, class-wise)
- Phone Pass (issue + return tracking)
- Gate Pass (issue + return tracking)
- Fines (add, pay, outstanding total)
- Admin Panel (classes + students + user management)
