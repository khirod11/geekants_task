# 🛠️ Engineering Resource Management System

A full-stack application for managing engineering team capacity and project assignments. Built with **React + TypeScript** on the frontend and **Node.js/NestJS** on the backend, the system enables managers to assign engineers to projects based on their skills and availability, while engineers can view their own assignments.


## 📌 Overview

This system supports:
- Role-based access for **managers** and **engineers**
- Real-time capacity tracking and workload enforcement
- Interactive dashboards and assignment management
- AI-assisted development for efficient and scalable delivery

## 🧰 Tech Stack

### Frontend
- **React + TypeScript**
- **Tailwind CSS + ShadCN UI**
- **React Hook Form**
- **Zustand** for state management

### Backend
- **NestJS**
- **MongoDB** with Mongoose (or similar schema-based DB)
- **RESTful API** design
- **JWT Authentication**

## ✨ Features

### 🔐 Authentication & Roles
- Login system with JWT
- Two roles: `manager` and `engineer`
- Managers can create projects and assign engineers
- Engineers can view only their own assignments

### 👷 Engineer Management
- Store profile details: name, email, role, skills, department
- Capacity indicator (100% for full-time, 50% for part-time)
- Track availability in real time

### 🚀 Project Management
- Create/update/delete projects with:
  - Name, description, required skills, timeline, status
  - Team size, and engineer allocations (by %)

### 📋 Assignments
- Assign engineers to projects
- Specify start/end dates, role, and allocation %
- Prevent over-assignment based on current capacity

### 📊 Dashboards
- Manager view: overview of all team/project status
- Engineer view: personal assignments and workload
- Visual indicators: charts, tables, timeline views

### 🔎 Filtering & Analytics
- Filter engineers by skills
- Filter projects by status
- Basic analytics: team utilization, engineer availability

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB installed locally or via Atlas (I've already included an Atlas URL)
- pnpm / yarn / npm (your choice)

## 🔧 Setup Instructions

```bash
1. git clone https://github.com/khirod11/geekants_task.git
2. cd geekants_task.git
3. Setup backend
    cd backend
    npm install           # or yarn / npm install
    npm run start:dev              # starts backend on http://localhost:3000
4. Setup frontend
    cd frontend
    npm install           # or yarn / npm install
    npm run dev              # starts frontend on http://localhost:5173
```

>**Note**: I've included the MongoURI in the backend for the preloaded data. The database already has some sample data inside it for testing. You can signup and login using your own email and password. 

## Here is the manager's credentials for testing:<br>
email: *manager1@gmail.com*<br>
password: *password123*<br>
