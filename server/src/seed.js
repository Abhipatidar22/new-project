import { db } from './db.js'

const projects = [
  { name: 'Consultation', description: 'Project Name, Location', image: null },
  { name: 'Design', description: 'Project Name, Location', image: null },
  { name: 'Marketing & Design', description: 'Project Name, Location', image: null },
  { name: 'Consultation & Marketing', description: 'Project Name, Location', image: null },
  { name: 'Evaluation', description: 'Project Name, Location', image: null }
]

const clients = [
  { name: 'Rowhan Smith', designation: 'CEO, Foreclosure', description: 'Lorem ipsum dolor sit amet...', image: null },
  { name: 'Shipra Kayak', designation: 'Brand Designer', description: 'Lorem ipsum dolor sit amet...', image: null },
  { name: 'John Lepore', designation: 'CEO, Foreclosure', description: 'Lorem ipsum dolor sit amet...', image: null },
  { name: 'Marry Freeman', designation: 'Marketing Manager at Mixit', description: 'Lorem ipsum dolor sit amet...', image: null },
  { name: 'Lucy', designation: 'Sales Rep at Alibaba', description: 'Lorem ipsum dolor sit amet...', image: null }
]

await new Promise((resolve, reject) => {
  db.serialize(() => {
    db.run('DELETE FROM projects')
    db.run('DELETE FROM clients')
    const pStmt = db.prepare('INSERT INTO projects (name, description, image) VALUES (?, ?, ?)')
    projects.forEach(p => pStmt.run(p.name, p.description, p.image))
    pStmt.finalize()
    const cStmt = db.prepare('INSERT INTO clients (name, designation, description, image) VALUES (?, ?, ?, ?)')
    clients.forEach(c => cStmt.run(c.name, c.designation, c.description, c.image))
    cStmt.finalize()
    resolve()
  })
})

console.log('Seeded projects and clients')