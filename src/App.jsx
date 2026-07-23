import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { fetchNotes, createNote, updateNote, deleteNote } from './notesApi'
import './App.css'

function LoginScreen({ signInWithGoogle }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-top">
          <span className="login-card-label">Memory Memo</span>
        </div>
        <h1>
          오늘은 어떤
          <br />
          메모를 남길까요?
        </h1>
        <button className="google-btn" onClick={signInWithGoogle}>
          Login With Google
        </button>
      </div>
    </div>
  )
}

function Header({ email, signOut }) {
  return (
    <header className="app-header">
      <h1>내 메모</h1>
      <div className="user-info">
        <span>{email}</span>
        <button onClick={signOut}>로그아웃</button>
      </div>
    </header>
  )
}

function NoteForm({ onAdd }) {
  const [content, setContent] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    await onAdd(content)
    setContent('')
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <textarea
        placeholder="메모를 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit">저장 ⌘+↵</button>
    </form>
  )
}

function NoteItem({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)

  const handleSave = async () => {
    await onUpdate(note.id, content)
    setEditing(false)
  }

  return (
    <li className="note-item">
      {editing ? (
        <>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="note-actions">
            <button onClick={handleSave}>저장</button>
            <button onClick={() => setEditing(false)}>취소</button>
          </div>
        </>
      ) : (
        <>
          <p>{note.content}</p>
          <span className="note-date">
            {new Date(note.created_at).toLocaleString()}
          </span>
          <div className="note-actions">
            <button onClick={() => setEditing(true)}>수정</button>
            <button onClick={() => onDelete(note.id)}>삭제</button>
          </div>
        </>
      )}
    </li>
  )
}

function NotesApp({ session, signOut }) {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    fetchNotes().then(setNotes)
  }, [])

  const handleAdd = async (content) => {
    const note = await createNote(content, session.user.id)
    setNotes((prev) => [note, ...prev])
  }

  const handleUpdate = async (id, content) => {
    const note = await updateNote(id, content)
    setNotes((prev) => prev.map((n) => (n.id === id ? note : n)))
  }

  const handleDelete = async (id) => {
    await deleteNote(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="notes-app">
      <Header email={session.user.email} signOut={signOut} />
      <div className="notes-app-body">
        <div className="notes-app-left">
          {notes.length === 0 ? (
            <div className="note-list-empty">우측에 메모를 입력하여 추가해보세요</div>
          ) : (
            <ul className="note-list">
              {notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>
        <div className="notes-app-right">
          <NoteForm onAdd={handleAdd} />
        </div>
      </div>
    </div>
  )
}

function App() {
  const { session, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return <div className="loading">불러오는 중...</div>

  return session ? (
    <NotesApp session={session} signOut={signOut} />
  ) : (
    <LoginScreen signInWithGoogle={signInWithGoogle} />
  )
}

export default App
