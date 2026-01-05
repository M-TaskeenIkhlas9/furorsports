import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const navigate = useNavigate();

  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', categoryId: '' });

  useEffect(() => {
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
      return;
    }
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetch(`${API_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/fetch(`${API_URL}/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryForm.name })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setCategoryForm({ name: '' });
        setShowAddCategory(false);
        fetchCategories();
        alert('Category added successfully!');
      } else {
        alert(data.error || 'Failed to add category');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryForm.name })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setCategoryForm({ name: '' });
        setEditingCategory(null);
        fetchCategories();
        alert('Category updated successfully!');
      } else {
        alert(data.error || 'Failed to update category');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure? This will delete the category and all its subcategories. Products using this category will need to be updated.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success || response.ok) {
        fetchCategories();
        alert('Category deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/categories/${subcategoryForm.categoryId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subcategoryForm.name })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setSubcategoryForm({ name: '', categoryId: '' });
        setShowAddSubcategory(null);
        fetchCategories();
        alert('Subcategory added successfully!');
      } else {
        alert(data.error || 'Failed to add subcategory');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateSubcategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/categories/subcategories/${editingSubcategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subcategoryForm.name })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setSubcategoryForm({ name: '', categoryId: '' });
        setEditingSubcategory(null);
        fetchCategories();
        alert('Subcategory updated successfully!');
      } else {
        alert(data.error || 'Failed to update subcategory');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/categories/subcategories/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success || response.ok) {
        fetchCategories();
        alert('Subcategory deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete subcategory');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading categories...</div>;
  }

  return (
    <div className="admin-categories-page">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1>Category Management</h1>
              <p className="admin-subtitle">Manage product categories and subcategories</p>
            </div>
            <div>
              <button 
                onClick={() => navigate('/admin/dashboard')} 
                className="btn btn-outline"
              >
                ← Dashboard
              </button>
              <button 
                onClick={() => {
                  setShowAddCategory(true);
                  setEditingCategory(null);
                  setCategoryForm({ name: '' });
                }} 
                className="btn btn-primary"
                style={{ marginLeft: '1rem' }}
              >
                + Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          {showAddCategory && (
            <div className="admin-form-card">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ name: e.target.value })}
                    required
                    placeholder="e.g., Sports Uniforms"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddCategory(false);
                      setEditingCategory(null);
                      setCategoryForm({ name: '' });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="categories-container">
            <h2>All Categories ({categories.length})</h2>
            {categories.length === 0 ? (
              <div className="no-categories">
                <p>No categories found. Add your first category!</p>
              </div>
            ) : (
              <div className="categories-list">
                {categories.map(category => (
                  <div key={category.id} className="category-card">
                    <div className="category-header">
                      <h3>{category.name}</h3>
                      <div className="category-actions">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm({ name: category.name });
                            setShowAddCategory(true);
                          }}
                          className="btn-action btn-edit"
                          title="Edit Category"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="btn-action btn-delete"
                          title="Delete Category"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setShowAddSubcategory(category.id);
                            setSubcategoryForm({ name: '', categoryId: category.id });
                            setEditingSubcategory(null);
                          }}
                          className="btn-action btn-add-sub"
                          title="Add Subcategory"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add Sub
                        </button>
                      </div>
                    </div>

                    {showAddSubcategory === category.id && (
                      <div className="subcategory-form-card">
                        <h4>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h4>
                        <form onSubmit={editingSubcategory ? handleUpdateSubcategory : handleAddSubcategory}>
                          <div className="form-group">
                            <label>Subcategory Name *</label>
                            <input
                              type="text"
                              value={subcategoryForm.name}
                              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                              required
                              placeholder="e.g., T-Shirts"
                            />
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                              {editingSubcategory ? 'Update' : 'Add'} Subcategory
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddSubcategory(null);
                                setEditingSubcategory(null);
                                setSubcategoryForm({ name: '', categoryId: '' });
                              }}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="subcategories-list">
                        {category.subcategories.map(sub => (
                          <div key={sub.id} className="subcategory-item">
                            <span>{sub.name}</span>
                            <div className="subcategory-actions">
                              <button
                                onClick={() => {
                                  setEditingSubcategory(sub);
                                  setSubcategoryForm({ name: sub.name, categoryId: category.id });
                                  setShowAddSubcategory(category.id);
                                }}
                                className="btn-small btn-edit"
                                title="Edit"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                className="btn-small btn-delete"
                                title="Delete"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;

