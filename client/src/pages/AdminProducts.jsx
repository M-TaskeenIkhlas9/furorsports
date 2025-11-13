import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    subcategory: '',
    stock: 100
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'upload'
  const location = useLocation();
  const isMountedRef = useRef(true);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      if (isMountedRef.current) {
        setProducts(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
      return;
    }
    
    // Check if we're on the add route
    if (location.pathname === '/admin/products/add') {
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
    }
    
    setLoading(true);
    fetchProducts();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [location.pathname, fetchProducts, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      alert('Please select an image file first');
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', imageFile);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.imagePath }));
        alert('Image uploaded successfully!');
        setImageFile(null);
        setImagePreview('');
      } else {
        alert(data.error || 'Image upload failed');
      }
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        setFormData({
          name: '',
          description: '',
          price: '',
          image: '',
          category: '',
          subcategory: '',
          stock: 100
        });
        setShowAddForm(false);
        setEditingProduct(null);
        fetchProducts();
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      stock: product.stock || 100
    });
    setImagePreview(product.image || '');
    setImageFile(null);
    setImageInputType('url');
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        fetchProducts();
        alert('Product deleted successfully!');
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const categories = [
    'Martial Arts/Karate Uniforms',
    'Sports Uniforms',
    'Street Wears',
    'Fitness Wears'
  ];

  const subcategories = {
    'Sports Uniforms': [
      'American Football Uniforms',
      'Basketball Uniforms',
      'Goal Keeper Uniforms',
      'Soccer Uniforms',
      'Volleyball Uniforms'
    ],
    'Street Wears': [
      'Hoodies',
      'Jackets',
      'Polo Shirts',
      'T-Shirts',
      'Track Suits',
      'Training Vests'
    ],
    'Fitness Wears': [
      'Compression Shirts',
      'Compression Shorts',
      'Compression Suit',
      'Leggings',
      'Sports Bras'
    ]
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-products-page">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1>Product Management</h1>
              <p className="admin-subtitle">Manage your inventory</p>
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
                  setShowAddForm(!showAddForm);
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    image: '',
                    category: '',
                    subcategory: '',
                    stock: 100
                  });
                  setImageFile(null);
                  setImagePreview('');
                  setImageInputType('url');
                }} 
                className="btn btn-primary"
                style={{ marginLeft: '1rem' }}
              >
                {showAddForm ? 'Cancel' : '+ Add Product'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          {showAddForm && (
            <div className="admin-form-card">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="admin-product-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subcategory</label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      disabled={!formData.category || !subcategories[formData.category]}
                    >
                      <option value="">Select Subcategory</option>
                      {formData.category && subcategories[formData.category]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <div className="image-input-toggle">
                    <button
                      type="button"
                      className={`toggle-btn ${imageInputType === 'url' ? 'active' : ''}`}
                      onClick={() => {
                        setImageInputType('url');
                        setImageFile(null);
                        setImagePreview('');
                      }}
                    >
                      Use URL
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${imageInputType === 'upload' ? 'active' : ''}`}
                      onClick={() => {
                        setImageInputType('upload');
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                    >
                      Upload from Device
                    </button>
                  </div>

                  {imageInputType === 'url' ? (
                    <div className="image-url-input">
                      <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={(e) => {
                          handleInputChange(e);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="/images/products/example.jpg or https://example.com/image.jpg"
                      />
                      {formData.image && (
                        <div className="image-preview-container">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="image-preview"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="image-upload-input">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      {imagePreview && (
                        <div className="image-preview-container">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="image-preview"
                          />
                        </div>
                      )}
                      {imageFile && (
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploading}
                          className="btn btn-primary upload-btn"
                        >
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                      )}
                      {formData.image && imageInputType === 'upload' && (
                        <div className="upload-success">
                          ✓ Image uploaded: {formData.image}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="100"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProduct(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="products-table-container">
            <h2>All Products ({products.length})</h2>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-products">No products found</td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          <img 
                            src={product.image || 'https://via.placeholder.com/50'} 
                            alt={product.name}
                            className="product-thumb"
                            loading="lazy"
                            onError={(e) => {
                              if (e.target.src !== 'https://via.placeholder.com/50?text=No+Image') {
                                e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                              }
                            }}
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>
                          <div className="category-tags">
                            <span className="category-badge">{product.category}</span>
                            {product.subcategory && (
                              <span className="subcategory-badge">{product.subcategory}</span>
                            )}
                          </div>
                        </td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>
                          <span className={product.stock < 10 ? 'low-stock' : ''}>
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleEdit(product)}
                              className="btn-action btn-edit"
                              title="Edit Product"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="btn-action btn-delete"
                              title="Delete Product"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

