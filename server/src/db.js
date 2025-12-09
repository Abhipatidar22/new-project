import sqlite3 from 'sqlite3'
import fs from 'fs'
import path from 'path'

sqlite3.verbose()

// Resolve paths relative to the server package root (../ from src)
const serverRoot = path.resolve(path.dirname(process.argv[1]), '..')
const dataDir = path.join(serverRoot, 'data')
const uploadsDir = path.join(serverRoot, 'uploads')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const dbPath = path.join(dataDir, 'app.db')
const db = new sqlite3.Database(dbPath)

const initSql = `
CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	description TEXT NOT NULL,
	image TEXT
);
CREATE TABLE IF NOT EXISTS clients (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	designation TEXT NOT NULL,
	description TEXT NOT NULL,
	image TEXT
);
CREATE TABLE IF NOT EXISTS contacts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	fullName TEXT NOT NULL,
	email TEXT NOT NULL,
	mobile TEXT NOT NULL,
	city TEXT NOT NULL,
	createdAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS subscriptions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL,
	createdAt TEXT NOT NULL
);
`

db.exec(initSql)

export { db, uploadsDir }