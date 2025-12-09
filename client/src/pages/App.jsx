import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'
const IMG_BASE = import.meta.env.VITE_IMG_BASE || 'http://localhost:5000'

function imageUrl(pathOrUrl, fallback) {
  if (!pathOrUrl) return fallback
  // If server returned relative like "/uploads/..", prefix backend origin
  if (pathOrUrl.startsWith('/uploads/')) return IMG_BASE + pathOrUrl
  return pathOrUrl
}

export default function App() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [contact, setContact] = useState({ fullName: '', email: '', mobile: '', city: '' })
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    fetch(`${API}/projects`).then(r => r.json()).then(setProjects)
    fetch(`${API}/clients`).then(r => r.json()).then(setClients)
  }, [])

  async function submitContact(e) {
    e.preventDefault()
    const res = await fetch(`${API}/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contact) })
    if (res.ok) {
      alert('Submitted contact details!')
      setContact({ fullName: '', email: '', mobile: '', city: '' })
    }
  }

  async function subscribeNewsletter() {
    if (!newsletterEmail) return
    const res = await fetch(`${API}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newsletterEmail }) })
    if (res.ok) {
      alert('Subscribed!')
      setNewsletterEmail('')
    }
  }

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Consultation, Design & Marketing</h1>
          <p>Not Your Average Realtor</p>
        </div>
      </section>

      <div className="container">
        <h2 className="section-title">Our Projects</h2>
        <div className="grid grid-5">
          {projects.map(p => (
            <div key={p.id} className="card">
              <img src={imageUrl(p.image, 'https://picsum.photos/seed/' + p.id + '/450/350')} alt={p.name} />
              <div className="content">
                <h3 style={{ color: '#1e74ff' }}>{p.name}</h3>
                <p>{p.description}</p>
                <button className="button" onClick={() => setSelectedProject(p)}>READ MORE</button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="section-title">Happy Clients</h2>
        <div className="grid grid-5">
          {clients.map(c => (
            <div key={c.id} className="card" style={{ paddingBottom: 12 }}>
              <img src={imageUrl(c.image, 'https://picsum.photos/seed/client' + c.id + '/450/350')} alt={c.name} />
              <div className="content">
                <p>{c.description}</p>
                <h3 style={{ color: '#1e74ff' }}>{c.name}</h3>
                <p style={{ color: '#777' }}>{c.designation}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row" style={{ marginTop: 24 }}>
          <div>
            <h2 className="section-title">Newsletter</h2>
            <div className="newsletter">
              <span>Subscribe Us</span>
              <input placeholder="Enter Email Address" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} />
              <button onClick={subscribeNewsletter}>Subscribe</button>
            </div>
          </div>

          <div className="form">
            <h2>Get a Free Consultation</h2>
            <form onSubmit={submitContact}>
              <input placeholder="Full Name" value={contact.fullName} onChange={e => setContact({ ...contact, fullName: e.target.value })} />
              <input placeholder="Enter Email Address" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
              <input placeholder="Mobile Number" value={contact.mobile} onChange={e => setContact({ ...contact, mobile: e.target.value })} />
              <input placeholder="Area, City" value={contact.city} onChange={e => setContact({ ...contact, city: e.target.value })} />
              <button type="submit">Get Quick Quote</button>
            </form>
          </div>
        </div>

        <AdminPanel />

        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />)
        }
      </div>
    </div>
  )
}

function AdminPanel() {
  const [tab, setTab] = useState('projects')
  return (
    <div style={{ marginTop: 40 }}>
      <h2 className="section-title">Admin Panel</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {['projects','clients','contacts','subscriptions'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: tab===t?'#1e74ff':'#fff', color: tab===t?'#fff':'#333' }}>{t}</button>
        ))}
      </div>
      {tab === 'projects' && <ProjectsAdmin />}
      {tab === 'clients' && <ClientsAdmin />}
      {tab === 'contacts' && <ContactsAdmin />}
      {tab === 'subscriptions' && <SubscriptionsAdmin />}
    </div>
  )
}

function ProjectModal({ project, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:12, maxWidth:700, width:'100%', overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #eee' }}>
          <h3 style={{ margin:0, color:'#1e74ff' }}>{project.name}</h3>
          <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <img src={imageUrl(project.image, 'https://picsum.photos/seed/' + project.id + '/700/350')} alt={project.name} style={{ width:'100%', height:350, objectFit:'cover' }} />
        <div style={{ padding:20 }}>
          <p style={{ marginTop:0 }}>{project.description}</p>
        </div>
      </div>
    </div>
  )
}

function ProjectsAdmin() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', description: '', image: null })
  useEffect(() => { fetch(`${API}/projects`).then(r=>r.json()).then(setItems) }, [])
  async function addItem(e) {
    e.preventDefault()
    if (!form.name || !form.description) { alert('Please enter name and description'); return }
    if (!form.image) { alert('Please select an image to upload'); return }
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    if (form.image) fd.append('image', form.image)
    const res = await fetch(`${API}/projects`, { method: 'POST', body: fd })
    if (res.ok) { const item = await res.json(); setItems([item, ...items]); setForm({ name:'', description:'', image:null }); alert('Project added with image!') }
    else { const err = await res.text(); alert('Failed to add project: ' + err) }
  }
  return (
    <div>
      <form onSubmit={addItem} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
        <input placeholder="Project Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="Project Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <input type="file" onChange={e=>setForm({...form,image:e.target.files[0]})} />
        <button type="submit" className="button">Add Project</button>
      </form>
      <div className="grid grid-5">
        {items.map(p => (
          <div key={p.id} className="card">
            <img src={imageUrl(p.image, 'https://picsum.photos/seed/' + p.id + '/450/350')} alt={p.name} />
            <div className="content">
              <h3 style={{ color: '#1e74ff' }}>{p.name}</h3>
              <p>{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClientsAdmin() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', designation: '', description: '', image: null })
  useEffect(() => { fetch(`${API}/clients`).then(r=>r.json()).then(setItems) }, [])
  async function addItem(e) {
    e.preventDefault()
    if (!form.name || !form.designation || !form.description) { alert('Please fill name, designation, and description'); return }
    if (!form.image) { alert('Please select an image to upload'); return }
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('designation', form.designation)
    fd.append('description', form.description)
    if (form.image) fd.append('image', form.image)
    const res = await fetch(`${API}/clients`, { method: 'POST', body: fd })
    if (res.ok) { const item = await res.json(); setItems([item, ...items]); setForm({ name:'', designation:'', description:'', image:null }); alert('Client added with image!') }
    else { const err = await res.text(); alert('Failed to add client: ' + err) }
  }
  return (
    <div>
      <form onSubmit={addItem} style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:12 }}>
        <input placeholder="Client Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="Designation" value={form.designation} onChange={e=>setForm({...form,designation:e.target.value})} />
        <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <input type="file" onChange={e=>setForm({...form,image:e.target.files[0]})} />
        <button type="submit" className="button">Add Client</button>
      </form>
      <div className="grid grid-5">
        {items.map(c => (
          <div key={c.id} className="card">
            <img src={imageUrl(c.image, 'https://picsum.photos/seed/client' + c.id + '/450/350')} alt={c.name} />
            <div className="content">
              <p>{c.description}</p>
              <h3 style={{ color: '#1e74ff' }}>{c.name}</h3>
              <p style={{ color: '#777' }}>{c.designation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactsAdmin() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch(`${API}/contacts`).then(r=>r.json()).then(setItems) }, [])
  return (
    <div>
      <div className="grid grid-3">
        {items.map(c => (
          <div key={c.id} className="card">
            <div className="content">
              <h3 style={{ color: '#1e74ff' }}>{c.fullName}</h3>
              <p>Email: {c.email}</p>
              <p>Mobile: {c.mobile}</p>
              <p>City: {c.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SubscriptionsAdmin() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch(`${API}/subscriptions`).then(r=>r.json()).then(setItems) }, [])
  return (
    <div>
      <div className="grid grid-3">
        {items.map(s => (
          <div key={s.id} className="card">
            <div className="content">
              <h3 style={{ color: '#1e74ff' }}>{s.email}</h3>
              <p>Subscribed: {new Date(s.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
