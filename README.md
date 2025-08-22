# 🍽️ Mess Management System

A web-based application to efficiently manage hostel mess operations including meal status tracking, guest meal handling, and admin reports. Built with a modern tech stack: **React.js**, **Node.js** and **MySQL**.

---

## 🔧 Features

### 🧑‍🎓 Border (Hostel Resident)
- Login with username/password
- Toggle meal status for the day (ON/OFF)
- View meal history (last 30 entries)
- View current month's total meals and cost
- Update own username/password
- Add guest meals (with guest name & ON/OFF)
- View guest meal history

### 🛠️ Admin
- Login to admin portal
- View all borders with:
  - Name, Room No.
  - Current meal status
  - Time of last update
- Filter/search borders by name
- Mark “Meal Taken” manually
- Export meal status data to Excel (coming soon)

---

## 🖥️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React.js   |
| Backend     | Node.js + Express.js |
| Database    | MySQL      |
| Styling     | CSS        |
| API Calls   | Axios      |
| Date Utils  | JavaScript Date APIs |
| Dev Tools   | Nodemon, MySQL2, CORS |

---

## 🗃️ Database Schema

### `users`
- `id` (PK)
- `name`
- `username`
- `password`
- `phone`
- `room`
- `address`
- `role` (`border` or `admin`)

### `meal_status`
- `id` (PK)
- `user_id` (FK to `users`)
- `date` (YYYY-MM-DD)
- `status` (`ON`/`OFF`)
- `time` (HH:MM:SS)

### `guest_meals`
- `id` (PK)
- `user_id` (FK to `users`)
- `guest_name`
- `status` (`ON`/`OFF`)
- `date` (YYYY-MM-DD)
- `time` (HH:MM:SS)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kanaimandal2002/MessManagementSystem.git
cd MessManagementSystem
