import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { getCollectionPageSchema, getBreadcrumbSchema } from '../utils/structuredData'
import { API_URL, getImageUrl } from '../config/api'
import './Products.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const search = searchParams.get('search')

  useEffect(() => {
    fetchProducts()
  }, [category, subcategory, search])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let url = `${API_URL}/api/products`
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (subcategory) params.append('subcategory', subcategory)
      if (search) params.append('search', search)
      if (params.toString()) url += '?' + params.toString()

      const response = await fetch(url)
      const data = await response.json()
      // Ensure data is an array
      setProducts(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set empty array on error
      setLoading(false)
    }
  }

  const pageTitle = category 
    ? `${category} - Furor Sport | Professional Sports Wear`
    : subcategory
    ? `${subcategory} - Furor Sport | Professional Sports Wear`
    : "All Products - Furor Sport | Professional Sports Wear & Fitness Apparel";
  
  const pageDescription = category
    ? `Browse ${category} products from Furor Sport. High-quality professional sports wear and fitness apparel from Sialkot, Pakistan. Worldwide shipping available.`
    : subcategory
    ? `Browse ${subcategory} products from Furor Sport. Premium quality sports wear and fitness apparel.`
    : "Browse all products from Furor Sport. Professional sports wear, fitness apparel, compression wear, and martial arts equipment. Family-owned business from Sialkot, Pakistan.";

  const breadcrumbItems = [
    { name: "Home", url: "https://furorsport-lac-one-35.vercel.app/" },
    { name: "Products", url: "https://furorsport-lac-one-35.vercel.app/products" }
  ];
  if (category) {
    breadcrumbItems.push({ 
      name: category, 
      url: `https://furorsport-lac-one-35.vercel.app/products?category=${encodeURIComponent(category)}` 
    });
  }
  if (subcategory) {
    breadcrumbItems.push({ 
      name: subcategory, 
      url: `https://furorsport-lac-one-35.vercel.app/products?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}` 
    });
  }

  const collectionSchema = getCollectionPageSchema(category || subcategory, products);
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="products-page">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${category || subcategory || 'sports wear'}, fitness apparel, professional sports wear, Pakistan, Furor Sport, ${category || subcategory || 'athletic wear'}`}
        url={category ? `/products?category=${encodeURIComponent(category)}` : subcategory ? `/products?subcategory=${encodeURIComponent(subcategory)}` : "/products"}
        structuredData={[collectionSchema, breadcrumbSchema]}
      />
      <div className="container">
        <div className="page-header">
          <h1 className="products-page-title">OUR PRODUCTS</h1>
          {category && <p className="category-filter">Category: {category}</p>}
          {subcategory && <p className="subcategory-filter">Subcategory: {subcategory}</p>}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products found.</p>
            <Link to="/products" className="btn btn-primary">View All Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`}>
                  <div className="product-image">
                    <img 
                      src={getImageUrl(product.image) || '/placeholder-product.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Product'
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <button className="btn btn-primary">View Details</button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products

