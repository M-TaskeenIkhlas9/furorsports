import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    image: '',
    category: '',
    subcategory: '',
    stock: 100,
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'upload'
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const location = useLocation();
  const isMountedRef = useRef(true);
  const [productImages, setProductImages] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newVariant, setNewVariant] = useState({ size: '', color: '', priceAdjustment: 0 });
  const [showImageSection, setShowImageSection] = useState(false);
  const [showVariantSection, setShowVariantSection] = useState(false);
  const [imageInputTypeMultiple, setImageInputTypeMultiple] = useState('url');

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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      
      // Transform data for easier use
      const categoriesList = data.map(cat => cat.name);
      const subcategoriesMap = {};
      
      data.forEach(cat => {
        if (cat.subcategories && cat.subcategories.length > 0) {
          subcategoriesMap[cat.name] = cat.subcategories.map(sub => sub.name);
        }
      });
      
      if (isMountedRef.current) {
        setCategories(categoriesList);
        setSubcategories(subcategoriesMap);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    fetchCategories();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [location.pathname, fetchProducts, fetchCategories, navigate]);

  // Filter products based on URL parameters, search, and category
  useEffect(() => {
    let filtered = [...products];
    
    // Apply low-stock filter from URL
    const filter = searchParams.get('filter');
    if (filter === 'low-stock') {
      filtered = filtered.filter(product => (product.stock || 0) < 10);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.name?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search) ||
          product.subcategory?.toLowerCase().includes(search)
        );
      });
    }
    
    // Apply category filter
    if (categoryFilter !== '') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchParams, searchTerm, categoryFilter]);

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
          sale_price: '',
          image: '',
          category: '',
          subcategory: '',
          stock: 100,
          featured: false
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

  const fetchProductImages = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProductImages(data.imageData || []);
        setProductVariants(data.variants || []);
      }
    } catch (error) {
      console.error('Error fetching product images/variants:', error);
    }
  };

  const handleEdit = async (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      sale_price: product.sale_price || '',
      image: product.image || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      stock: product.stock || 100,
      featured: product.featured === 1 || product.featured === true
    });
    setImagePreview(product.image || '');
    setImageFile(null);
    setImageInputType('url');
    setShowAddForm(true);
    // Fetch product images and variants
    await fetchProductImages(product.id);
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
                    sale_price: '',
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

                  <div className="form-group">
                    <label>Sale Price ($) <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '600' }}>SALE</span></label>
                    <input
                      type="number"
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="Leave empty for no sale"
                    />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(203, 213, 225, 0.7)' }}>
                      Set a sale price to show discount. Product will display with original price crossed out.
                    </p>
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

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span>⭐ Feature in Hero Section (Homepage)</span>
                  </label>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(203, 213, 225, 0.7)' }}>
                    Featured products will appear in the hero carousel on the homepage
                  </p>
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
                      setProductImages([]);
                      setProductVariants([]);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Product Images and Variants Management - Only show when editing */}
              {editingProduct && (
                <div className="product-management-sections">
                  {/* Multiple Images Section */}
                  <div className="management-section">
                    <div className="section-header" onClick={() => setShowImageSection(!showImageSection)}>
                      <h3>📷 Product Images ({productImages.length})</h3>
                      <span>{showImageSection ? '▼' : '▶'}</span>
                    </div>
                    {showImageSection && (
                      <div className="section-content">
                        <div className="images-list">
                          {productImages.map((img) => (
                            <div key={img.id} className="image-item">
                              <img src={img.image_url} alt={`Product image ${img.id}`} />
                              {img.id !== 0 && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!window.confirm('Are you sure you want to delete this image?')) return;
                                    try {
                                      const deleteResponse = await fetch(`/api/admin/products/${editingProduct.id}/images/${img.id}`, {
                                        method: 'DELETE'
                                      });
                                      if (deleteResponse.ok) {
                                        await fetchProductImages(editingProduct.id);
                                      } else {
                                        alert('Error deleting image');
                                      }
                                    } catch (error) {
                                      console.error('Error deleting image:', error);
                                      alert('Error deleting image');
                                    }
                                  }}
                                  className="btn-remove-image"
                                >
                                  ×
                                </button>
                              )}
                              {img.id === 0 && (
                                <span className="main-image-badge">Main</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="add-image-form">
                          <div className="image-input-toggle" style={{ marginBottom: '1rem' }}>
                            <button
                              type="button"
                              className={`toggle-btn ${imageInputTypeMultiple === 'url' ? 'active' : ''}`}
                              onClick={() => {
                                setImageInputTypeMultiple('url');
                                setNewImageFile(null);
                                setNewImagePreview('');
                              }}
                            >
                              Use URL
                            </button>
                            <button
                              type="button"
                              className={`toggle-btn ${imageInputTypeMultiple === 'upload' ? 'active' : ''}`}
                              onClick={() => {
                                setImageInputTypeMultiple('upload');
                                setNewImageUrl('');
                              }}
                            >
                              Upload from Device
                            </button>
                          </div>

                          {imageInputTypeMultiple === 'url' ? (
                            <>
                              <input
                                type="text"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="Enter image URL"
                                className="image-url-input"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!newImageUrl.trim()) return;
                                  try {
                                    const response = await fetch(`/api/admin/products/${editingProduct.id}/images`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ imageUrl: newImageUrl })
                                    });
                                    if (response.ok) {
                                      setNewImageUrl('');
                                      await fetchProductImages(editingProduct.id);
                                    }
                                  } catch (error) {
                                    alert('Error adding image');
                                  }
                                }}
                                className="btn btn-primary"
                              >
                                Add Image
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setNewImageFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setNewImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="file-input"
                                style={{ marginBottom: '0.75rem' }}
                              />
                              {newImagePreview && (
                                <div className="image-preview-container" style={{ marginBottom: '0.75rem' }}>
                                  <img src={newImagePreview} alt="Preview" className="image-preview" />
                                </div>
                              )}
                              {newImageFile && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setUploadingImage(true);
                                    try {
                                      const formDataToSend = new FormData();
                                      formDataToSend.append('image', newImageFile);

                                      const uploadResponse = await fetch('/api/admin/upload-image', {
                                        method: 'POST',
                                        body: formDataToSend
                                      });

                                      if (uploadResponse.ok) {
                                        const uploadData = await uploadResponse.json();
                                        const imageUrl = `/images/products/${uploadData.filename}`;
                                        
                                        const addResponse = await fetch(`/api/admin/products/${editingProduct.id}/images`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ imageUrl })
                                        });
                                        
                                        if (addResponse.ok) {
                                          setNewImageFile(null);
                                          setNewImagePreview('');
                                          await fetchProductImages(editingProduct.id);
                                        }
                                      }
                                    } catch (error) {
                                      alert('Error uploading image');
                                    } finally {
                                      setUploadingImage(false);
                                    }
                                  }}
                                  disabled={uploadingImage}
                                  className="btn btn-primary"
                                >
                                  {uploadingImage ? 'Uploading...' : 'Upload & Add Image'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sizes and Colors Section */}
                  <div className="management-section">
                    <div className="section-header" onClick={() => setShowVariantSection(!showVariantSection)}>
                      <h3>🎨 Sizes & Colors ({productVariants.length})</h3>
                      <span>{showVariantSection ? '▼' : '▶'}</span>
                    </div>
                    {showVariantSection && (
                      <div className="section-content">
                        <div className="variants-list">
                          {productVariants.map((variant) => (
                            <div key={variant.id} className="variant-item">
                              <div>
                                {variant.size && <span className="variant-tag">Size: {variant.size}</span>}
                                {variant.color && <span className="variant-tag">Color: {variant.color}</span>}
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/admin/products/${editingProduct.id}/variants/${variant.id}`, {
                                      method: 'DELETE'
                                    });
                                    if (response.ok) {
                                      await fetchProductImages(editingProduct.id);
                                    }
                                  } catch (error) {
                                    alert('Error deleting variant');
                                  }
                                }}
                                className="btn-remove-variant"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="add-variant-form">
                          <div className="variant-inputs">
                            <input
                              type="text"
                              value={newVariant.size}
                              onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                              placeholder="Size (e.g., S, M, L)"
                              className="variant-input"
                            />
                            <input
                              type="text"
                              value={newVariant.color}
                              onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                              placeholder="Color (e.g., Red, Blue)"
                              className="variant-input"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!newVariant.size && !newVariant.color) {
                                alert('Please enter at least a size or color');
                                return;
                              }
                              try {
                                const response = await fetch(`/api/admin/products/${editingProduct.id}/variants`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(newVariant)
                                });
                                if (response.ok) {
                                  setNewVariant({ size: '', color: '', priceAdjustment: 0 });
                                  await fetchProductImages(editingProduct.id);
                                }
                              } catch (error) {
                                alert('Error adding variant');
                              }
                            }}
                            className="btn btn-primary"
                          >
                            Add Variant
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="products-table-container">
            <div className="products-header">
              <h2>
                {searchParams.get('filter') === 'low-stock'
                  ? `Low Stock Items (${filteredProducts.length})`
                  : `All Products (${filteredProducts.length})`
                }
              </h2>
              {searchParams.get('filter') && (
                <button 
                  onClick={() => navigate('/admin/products')} 
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Show All Products
                </button>
              )}
            </div>
            
            <div className="filters-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search products by name, description, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              
              <div className="category-filter">
                <label>Filter by Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="category-select"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              {(searchTerm || categoryFilter) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
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
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-products">No products found</td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
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
                        <td>
                          {product.sale_price && product.sale_price < product.price ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ color: '#ef4444', fontWeight: '700' }}>${product.sale_price.toFixed(2)}</span>
                              <span style={{ color: '#9ca3af', textDecoration: 'line-through', fontSize: '0.85rem' }}>${product.price.toFixed(2)}</span>
                              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>SALE</span>
                            </div>
                          ) : (
                            `$${product.price.toFixed(2)}`
                          )}
                        </td>
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

