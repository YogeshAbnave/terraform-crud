import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { itemsAPI } from '../services/api'

function EditItem() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const response = await itemsAPI.getOne(id)
      setFormData({
        name: response.data.name,
        description: response.data.description
      })
      setError(null)
    } catch (err) {
      setError('Failed to fetch item')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('All fields are required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await itemsAPI.update(id, formData)
      navigate('/')
    } catch (err) {
      setError('Failed to update item')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="form-container">
      <h2>Edit Item</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter item name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter item description"
            rows="4"
            required
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditItem
