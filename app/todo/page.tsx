'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Todo = {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: string
  completedAt?: string
}

const STORAGE_KEY = '2broderna-todos'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'created'>('date')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setTodos(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse todos:', e)
      }
    }
    setLoading(false)
  }, [])

  function save(next: Todo[]) {
    setTodos(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function addTodo() {
    const trimmedTitle = form.title.trim()
    
    if (!trimmedTitle) {
      alert('Fyll i åtminstone en titel')
      return
    }

    const todo: Todo = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: form.description.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      completed: false,
      createdAt: new Date().toISOString()
    }

    save([todo, ...todos])
    setForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium'
    })
    alert('Uppgift skapad! ✓')
  }

  function toggleTodo(id: string) {
    save(todos.map(t =>
      t.id === id
        ? {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : undefined
          }
        : t
    ))
  }

  function deleteTodo(id: string) {
    if (confirm('Är du säker på att du vill ta bort denna uppgift?')) {
      save(todos.filter(t => t.id !== id))
    }
  }

  function editTodo(id: string, updates: Partial<Todo>) {
    save(todos.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ))
  }

  function clearCompleted() {
    if (confirm('Är du säker på att du vill ta bort alla slutförda uppgifter?')) {
      save(todos.filter(t => !t.completed))
    }
  }

  function clearAll() {
    if (confirm('Är du säker? Detta tar bort ALLA uppgifter och kan inte ångras!')) {
      save([])
    }
  }

  // Filter todos
  let filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  // Sort todos
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    if (sortBy === 'date') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
  }

  if (loading) {
    return <main className="container"><p>Laddar...</p></main>
  }

  return (
    <main className="container">
      <section className="hero">
        <Link href="/" style={{ fontSize: '0.9rem', color: '#2563eb', textDecoration: 'none' }}>
          ← Tillbaka
        </Link>
        <h1>📋 To-Do Lista</h1>
        <p>Hantera dina uppgifter effektivt med prioritering och förfallodatum</p>
      </section>

      <section className="stats">
        <div className="stat-box">
          <div className="number">{stats.total}</div>
          <div className="label">Totala uppgifter</div>
        </div>
        <div className="stat-box">
          <div className="number">{stats.active}</div>
          <div className="label">Aktiva</div>
        </div>
        <div className="stat-box">
          <div className="number">{stats.completed}</div>
          <div className="label">Slutförda</div>
        </div>
        {stats.overdue > 0 && (
          <div className="stat-box" style={{ background: '#fee2e2' }}>
            <div className="number" style={{ color: '#dc2626' }}>{stats.overdue}</div>
            <div className="label" style={{ color: '#991b1b' }}>Förfallna</div>
          </div>
        )}
      </section>

      <section className="grid">
        <div className="card">
          <h2>✏️ Lägg till uppgift</h2>

          <label>Titel *</label>
          <input
            placeholder="Vad behöver göras?"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onKeyPress={e => e.key === 'Enter' && addTodo()}
          />

          <label>Beskrivning</label>
          <textarea
            placeholder="Fler detaljer (valfritt)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <label>Förfallodatum</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
          />

          <label>Prioritet</label>
          <select
            value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' })}
          >
            <option value="low">🟢 Låg</option>
            <option value="medium">🟡 Medel</option>
            <option value="high">🔴 Hög</option>
          </select>

          <button onClick={addTodo} className="success">➕ Lägg till</button>
        </div>

        <div className="card">
          <h2>🎯 Uppgifter</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              style={{ padding: '0.5rem', borderRadius: '0.25rem' }}
            >
              <option value="all">Alla ({stats.total})</option>
              <option value="active">Aktiva ({stats.active})</option>
              <option value="completed">Slutförda ({stats.completed})</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'priority' | 'created')}
              style={{ padding: '0.5rem', borderRadius: '0.25rem' }}
            >
              <option value="date">Sortera efter förfallodatum</option>
              <option value="priority">Sortera efter prioritet</option>
              <option value="created">Sortera efter skapad</option>
            </select>
          </div>

          {stats.completed > 0 && (
            <button onClick={clearCompleted} className="danger" style={{ marginBottom: '1rem' }}>
              🗑️ Ta bort slutförda ({stats.completed})
            </button>
          )}

          {todos.length > 0 && (
            <button onClick={clearAll} className="danger" style={{ marginBottom: '1rem' }}>
              🔥 Rensa allt
            </button>
          )}

          {filtered.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
              {todos.length === 0 ? '📭 Inga uppgifter ännu' : '✓ Inga uppgifter i denna kategori'}
            </p>
          ) : (
            filtered.map(todo => (
              <div key={todo.id} className="item" style={{ opacity: todo.completed ? 0.7 : 1 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                        {todo.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span className={`priority-badge priority-${todo.priority}`}>
                        {todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢'} {
                          todo.priority === 'high' ? 'Hög' : todo.priority === 'medium' ? 'Medel' : 'Låg'
                        }
                      </span>
                      {todo.dueDate && (
                        <span className={`due-date ${isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}>
                          📅 {formatDate(todo.dueDate)}
                        </span>
                      )}
                      {todo.completed && todo.completedAt && (
                        <span style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                          ✓ {formatDateTime(todo.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="danger"
                    style={{ padding: '0.5rem 1rem', width: 'auto', marginTop: 0 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sv-SE')
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function isOverdue(dueDate: string, completed: boolean) {
  if (completed) return false
  return new Date(dueDate) < new Date()
}
