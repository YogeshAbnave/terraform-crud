import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { itemsAPI } from '../services/api'

function ItemList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await itemsAPI.getAll()
      setItems(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await itemsAPI.delete(id)
      setItems(items.filter(item => item.id !== id))
    } catch (err) {
      alert('Failed to delete item')
      console.error(err)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="item-list">
      <h2>Items</h2>
      
      {items.length === 0 ? (
        <p className="empty-state">No items found. Create your first item!</p>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <small>Created: {new Date(item.created_at).toLocaleString()}</small>
              <div className="item-actions">
                <button 
                  onClick={() => navigate(`/edit/${item.id}`)}
                  className="btn btn-edit"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemList
