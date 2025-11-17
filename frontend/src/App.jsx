import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ItemList from './pages/ItemList'
import CreateItem from './pages/CreateItem'
import EditItem from './pages/EditItem'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>CRUD Application</h1>
          <div className="nav-links">
            <Link to="/">Items</Link>
            <Link to="/create">Create New</Link>
          </div>
        </nav>
        
        <main className="container">
          <Routes>
            <Route path="/" element={<ItemList />} />
            <Route path="/create" element={<CreateItem />} />
            <Route path="/edit/:id" element={<EditItem />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
