# Maestro-Lite Backend Deployment & Setup Guide (Windows)

## 1. Introduction

This guide explains how to deploy and run the **Maestro-Lite backend** on a Windows PC.

The backend is responsible for:
- Handling offline fuel transactions
- Managing local SQLite storage
- Synchronizing data with Supabase (cloud)
- Communicating with PTS2 controllers

### Technologies Used
- Node.js (LTS)
- SQLite (local offline database)
- Supabase (cloud database)
- PM2 (process manager for Windows)

---

## 2. Prerequisites

Ensure the following are installed:

- Windows 10 or later
- Node.js (LTS version)
- NPM
- Internet access (for initial setup and sync)
- Git (optional, if cloning repository)

---

## 3. Project Setup

### 3.1 Obtain the Project
Copy or clone the backend project to your PC:

```
C:\Users\Edward\Documents\GitHub\MAESTRO-LITE
```

### 3.2 Install Dependencies

Open a terminal in the project directory and run:

```bash
cd C:\Users\Edward\Documents\GitHub\MAESTRO-LITE
npm install
```

---

## 4. Running the Server (First Time)

Start the backend server:

```bash
node index.js
```

### Expected Console Output

```
[STARTUP] Loading modules...
Offline database initialized
Remote database connected
Offline sync service started
PTS polling service started
Server running on port 3000
```

### Verify Server

Open a browser and visit:

- http://localhost:3000
- http://localhost:3000/api-docs (Swagger UI)

---

## 5. Offline Database

### Location

```
C:\Users\Edward\Documents\GitHub\MAESTRO-LITE\data\offline.db
```

### Behavior
- Stores all offline transactions
- Automatically syncs with Supabase when internet connectivity is restored

---

## 6. Installing PM2 on Windows

PM2 ensures the backend:
- Restarts on crash
- Runs in the background
- Starts automatically on boot

### Install PM2

```bash
npm install -g pm2
npm install -g pm2-windows-startup
```

### Start Backend with PM2

```bash
cd C:\Users\Edward\Documents\GitHub\MAESTRO-LITE
pm2 start index.js --name fuel-server
```

### Enable Startup on Boot

```bash
pm2-startup install
pm2 save
```

### Verify Running Processes

```bash
pm2 list
```

---

## 7. Monitoring & Logs

### View Logs

```bash
pm2 logs fuel-server
```

### Restart Backend

```bash
pm2 restart fuel-server
```

### Stop Backend

```bash
pm2 stop fuel-server
```

---

## 8. Testing Offline & Cloud Sync

### Offline Test
1. Disconnect internet
2. Run a test fuel transaction
3. Confirm transaction is written to `offline.db`

### Sync Test
1. Reconnect internet
2. Confirm offline transactions are synced to Supabase

---

## 9. Best Practices

- Backup `offline.db` daily
- Monitor PM2 logs regularly
- Keep Node.js updated
- Ensure the station PC remains powered
- Maintain stable connections to pumps and RFID devices

---

## 10. Summary

- Backend is production-ready
- Automatic startup and crash recovery via PM2
- Fully supports offline and online modes
- Real-time communication with fuel pumps and cloud services

---

**End of Guide**
