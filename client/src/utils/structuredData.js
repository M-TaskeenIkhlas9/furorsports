// Structured Data (JSON-LD) Helper Functions

const siteUrl = 'https://furorsport-lac-one-35.vercel.app';

export const getOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Furor Sport",
    "alternateName": "Furor Sport (FS)",
    "url": siteUrl,
    "logo": `${siteUrl}/images/furor-sport-logo.png`,
    "description": "Family-owned company from Sialkot, Pakistan, manufacturing high-quality Professional Sports Wear, Fitness Wear, Casual Wear, and Martial Arts equipment.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Latif Villas, Near Masjid Nawab Bibi, Boota Road",
      "addressLocality": "Sialkot",
      "addressRegion": "Punjab",
      "postalCode": "",
      "addressCountry": "PK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-300-8522576",
      "contactType": "Customer Service",
      "email": "Furorsport1@gmail.com",
      "areaServed": "Worldwide",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://www.instagram.com/furorsport_",
      `https://wa.me/923008522576`
    ]
  };
};

export const getWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Furor Sport",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const getProductSchema = (product) => {
  if (!product) return null;
  
  const productUrl = `${siteUrl}/product/${product.id}`;
  const productImage = product.image || `${siteUrl}/images/placeholder-product.jpg`;
  const price = product.sale_price && product.sale_price < product.price 
    ? product.sale_price 
    : product.price;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - Professional sports wear from Furor Sport`,
    "image": product.images && product.images.length > 0 
      ? product.images.map(img => img.url || img)
      : [productImage],
    "brand": {
      "@type": "Brand",
      "name": "Furor Sport"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "USD",
      "price": price.toString(),
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Furor Sport"
      }
    },
    "category": product.category || "Sports Wear",
    "sku": product.id?.toString() || "",
    "mpn": product.id?.toString() || ""
  };
};

export const getBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const getCollectionPageSchema = (category, products) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category ? `${category} - Furor Sport` : "All Products - Furor Sport",
    "description": category 
      ? `Browse ${category} products from Furor Sport. High-quality professional sports wear and fitness apparel.`
      : "Browse all products from Furor Sport. Professional sports wear, fitness apparel, and martial arts equipment.",
    "url": category 
      ? `${siteUrl}/products?category=${encodeURIComponent(category)}`
      : `${siteUrl}/products`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products?.length || 0,
      "itemListElement": products?.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `${siteUrl}/product/${product.id}`
        }
      })) || []
    }
  };
};

