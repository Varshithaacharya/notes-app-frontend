import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useParams, Link } from 'react-router-dom';
import './App.css';

// JAVA BACKEND URL
const API_BASE_URL = "https://notes-app-backend-varshu.onrender.com/notes"; 

// 1. Component: Public Note View
const PublicNote = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // In Java Controller I mapped it to /notes/public/{id}
    axios.get(`${API_BASE_URL}/public/${id}`)
      .then(res => setNote(res.data))
      .catch(err => setError(true));
  }, [id]);

  if (error) return <div className="container">Note not found.</div>;
  if (!note) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="card">
        <h1>{note.title}</h1>
        <p style={{whiteSpace: 'pre-wrap'}}>{note.content}</p>
        <Link to="/"><button>Create Your Own Note</button></Link>
      </div>
    </div>
  );
};

// 2. Component: Main Dashboard
const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/`);
        setNotes(res.data);
    } catch (error) {
        console.error("Error connecting to backend", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, { title, content });
        setEditingId(null);
    } else {
        await axios.post(`${API_BASE_URL}/`, { title, content });
    }
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    fetchNotes();
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/public/${id}`;
    navigator.clipboard.writeText(link);
    alert("Public link copied: " + link);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1>My Notes App</h1>
      
      <div className="card">
        <h2>{editingId ? "Edit Note" : "Create Note"}</h2>
        <form onSubmit={handleSubmit}>
          <input 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="Content" 
            rows="4" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
          <button type="submit">{editingId ? "Update" : "Save"}</button>
          {editingId && <button onClick={() => setEditingId(null)} className="delete">Cancel</button>}
        </form>
      </div>

      <input 
        className="search-bar" 
        placeholder="Search notes..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
      />
      
      <div>
        {filteredNotes.map(note => (
          <div key={note.id} className="card note-item">
            <h3>{note.title}</h3>
            <p>{note.content.substring(0, 100)}...</p>
            <div className="note-actions">
              <button onClick={() => handleEdit(note)}>Edit</button>
              <button onClick={() => handleDelete(note.id)} className="delete">Delete</button>
              <button onClick={() => copyLink(note.id)} className="copy">Share Link</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/public/:id" element={<PublicNote />} />
      </Routes>
    </Router>
  );
}

export default App;