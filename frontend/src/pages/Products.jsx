import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  Eye,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { productsAPI, categoriesAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency, formatNumber, formatDate, getStatusColor, debounce } from '../utils/helpers'
import toast from 'react-hot-toast'
import ProductModal from '../components/ProductModal'

export default function Products() {
  const { hasPermission } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  // Initialize showLowStock from URL params to avoid state change
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [showLowStock, setShowLowStock] = useState(urlParams?.get('lowStock') === 'true')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Custom dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const categoryDropdownRef = useRef(null)
  const sortDropdownRef = useRef(null)

  // Product detail view state
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailProduct, setDetailProduct] = useState(null)

  // Frontend caching
  const [productsCache, setProductsCache] = useState(new Map())
  const [lastFetchTime, setLastFetchTime] = useState(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const limit = 10

  useEffect(() => {
    // Initial data fetch only
    fetchCategories()
    fetchProducts()

    // Mark as initialized after all initial calls are done
    setTimeout(() => setIsInitialized(true), 100)
  }, [])

  useEffect(() => {
    // Only fetch products when filters change AFTER initialization
    if (isInitialized) {
      const debouncedFetch = debounce(fetchProducts, 300)
      debouncedFetch()
    }
  }, [searchTerm, selectedCategory, showLowStock, sortBy, sortOrder, currentPage, isInitialized])

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false)
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Generate cache key based on filters
      const cacheKey = JSON.stringify({
        page: currentPage,
        limit,
        search: searchTerm,
        category: selectedCategory,
        lowStock: showLowStock,
        sortBy,
        sortOrder
      })

      // Check cache first
      const now = Date.now()
      const cached = productsCache.get(cacheKey)
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setProducts(cached.data.products)
        setTotalPages(cached.data.pagination.pages)
        setTotalProducts(cached.data.pagination.total)
        setLoading(false)
        return
      }

      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        category: selectedCategory,
        lowStock: showLowStock,
        sortBy,
        sortOrder
      }

      const response = await productsAPI.getAll(params)
      const data = response.data

      // Update cache
      setProductsCache(prev => new Map(prev).set(cacheKey, {
        data,
        timestamp: now
      }))
      setLastFetchTime(now)

      setProducts(data.products)
      setTotalPages(data.pagination.pages)
      setTotalProducts(data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleViewProduct = (product) => {
    setDetailProduct(product)
    setShowDetailModal(true)
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleDeleteProduct = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      await productsAPI.delete(productToDelete.id)
      toast.success('Product deleted successfully')
      // Clear cache when product is deleted
      setProductsCache(new Map())
      setLastFetchTime(null)
      fetchProducts()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete product'
      toast.error(message)
    } finally {
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    }
  }

  const handleProductSaved = () => {
    setShowModal(false)
    setSelectedProduct(null)
    // Clear cache when product is saved
    setProductsCache(new Map())
    setLastFetchTime(null)
    fetchProducts()
  }

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { label: 'Out of Stock', color: 'danger' }
    if (product.quantity <= product.minStock) return { label: 'Low Stock', color: 'warning' }
    return { label: 'In Stock', color: 'success' }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setShowLowStock(false)
    setSortBy('name')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your inventory and product catalog</p>
        </div>

        {hasPermission(['ADMIN', 'MANAGER']) && (
          <button
            onClick={handleAddProduct}
            className="btn btn-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-4">
          {/* Search - Full width on mobile */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Filter Row - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category Filter */}
            <div className="w-full relative" ref={categoryDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate">
                    {selectedCategory
                      ? categories.find(c => c.id === selectedCategory)?.name || 'All Categories'
                      : 'All Categories'
                    }
                  </span>
                  <svg
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedCategory('')
                          setCategoryDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${!selectedCategory ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id)
                            setCategoryDropdownOpen(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${selectedCategory === category.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                            }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="w-full relative" ref={sortDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate">
                    {sortBy === 'name' && sortOrder === 'asc' && 'Name A-Z'}
                    {sortBy === 'name' && sortOrder === 'desc' && 'Name Z-A'}
                    {sortBy === 'price' && sortOrder === 'asc' && 'Price Low-High'}
                    {sortBy === 'price' && sortOrder === 'desc' && 'Price High-Low'}
                    {sortBy === 'quantity' && sortOrder === 'asc' && 'Stock Low-High'}
                    {sortBy === 'quantity' && sortOrder === 'desc' && 'Stock High-Low'}
                    {sortBy === 'createdAt' && sortOrder === 'desc' && 'Newest First'}
                    {sortBy === 'createdAt' && sortOrder === 'asc' && 'Oldest First'}
                  </span>
                  <svg
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSortBy('name')
                          setSortOrder('asc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'name' && sortOrder === 'asc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Name A-Z
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('name')
                          setSortOrder('desc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'name' && sortOrder === 'desc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Name Z-A
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('price')
                          setSortOrder('asc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'price' && sortOrder === 'asc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Price Low-High
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('price')
                          setSortOrder('desc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'price' && sortOrder === 'desc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Price High-Low
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('quantity')
                          setSortOrder('asc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'quantity' && sortOrder === 'asc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Stock Low-High
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('quantity')
                          setSortOrder('desc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'quantity' && sortOrder === 'desc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Stock High-Low
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('createdAt')
                          setSortOrder('desc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'createdAt' && sortOrder === 'desc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Newest First
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('createdAt')
                          setSortOrder('asc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'createdAt' && sortOrder === 'asc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Oldest First
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="lowStock"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="lowStock" className="text-sm text-gray-700 whitespace-nowrap">
                <span className="hidden sm:inline">Low Stock Only</span>
                <span className="sm:hidden">Low Stock</span>
              </label>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="btn btn-outline whitespace-nowrap text-sm"
            >
              <Filter className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory || showLowStock) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="badge badge-primary text-xs">
                Search: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="badge badge-primary text-xs">
                Category: {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
            {showLowStock && (
              <span className="badge badge-warning text-xs">
                Low Stock Only
              </span>
            )}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Products ({formatNumber(totalProducts)})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {searchTerm || selectedCategory || showLowStock
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first product.'}
            </p>
            {hasPermission(['ADMIN', 'MANAGER']) && (
              <button onClick={handleAddProduct} className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product)
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-gray text-xs">
                            {product.category.name}
                          </span>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(product.price)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Cost: {formatCurrency(product.cost)}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatNumber(product.quantity)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Min: {product.minStock}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${stockStatus.color} text-xs`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td>
                          <p className="text-sm text-gray-900">
                            {formatDate(product.updatedAt)}
                          </p>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {/* View Details - Always visible */}
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View product details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {/* Edit/Delete - Only for Admin/Manager */}
                            {hasPermission(['ADMIN', 'MANAGER']) && (
                              <>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product)}
                                  className="p-2 text-gray-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3 p-4">
              {products.map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Product Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">{product.name}</h3>
                          <p className="text-sm text-gray-600 font-mono">{product.sku}</p>
                        </div>
                      </div>
                      <span className={`badge badge-${stockStatus.color} text-xs flex-shrink-0 px-2 py-1`}>
                        {stockStatus.label}
                      </span>
                    </div>

                    {/* Product Description - Truncated */}
                    {product.description && (
                      <div className="text-sm text-gray-600">
                        <p className="line-clamp-2">{product.description}</p>
                      </div>
                    )}

                    {/* Product Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Price</p>
                        <p className="font-bold text-lg text-gray-900">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-gray-500">Cost: {formatCurrency(product.cost)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Stock</p>
                        <p className="font-bold text-lg text-gray-900">{formatNumber(product.quantity)}</p>
                        <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                      </div>
                    </div>

                    {/* Category and Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-gray text-xs">
                          {product.category.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          {formatDate(product.updatedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* View Details - Always visible */}
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View product details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* Edit/Delete - Only for Admin/Manager */}
                        {hasPermission(['ADMIN', 'MANAGER']) && (
                          <>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="p-2 text-gray-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  <div className="mb-2 sm:mb-0">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalProducts)} of {totalProducts} products
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  {/* Page numbers - Responsive */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 3) {
                        pageNum = i + 1
                      } else if (currentPage <= 2) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 1) {
                        pageNum = totalPages - 2 + i
                      } else {
                        pageNum = currentPage - 1 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm rounded-lg ${currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 3 && (
                      <>
                        <span className="text-xs text-gray-500">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm rounded-lg ${currentPage === totalPages
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm text-xs sm:text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={handleProductSaved}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-danger-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Product
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="btn btn-danger"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && detailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Product Details</h3>
                      <p className="text-primary-100 text-sm">Complete product information</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    className="bg-white bg-opacity-20 rounded-md text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white p-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                {/* Product Header Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <Package className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{detailProduct.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-mono text-gray-600 bg-white px-2 py-1 rounded">{detailProduct.sku}</span>
                          <span className="text-sm font-mono text-gray-600 bg-white px-2 py-1 rounded">{detailProduct.barcode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const stockStatus = getStockStatus(detailProduct)
                        return (
                          <span className={`badge badge-${stockStatus.color} px-4 py-2 text-sm font-medium`}>
                            {stockStatus.label}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Basic Info & Description */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                          Basic Information
                        </h5>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</label>
                            <div className="mt-1">
                              <span className="badge badge-gray">{detailProduct.category.name}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Product ID</label>
                            <p className="mt-1 text-sm font-mono text-gray-900">{detailProduct.id}</p>
                          </div>
                        </div>
                        {detailProduct.description && (
                          <div className="mt-6">
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</label>
                            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{detailProduct.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial Information Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                          Financial Information
                        </h5>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-green-800">Selling Price</label>
                              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{formatCurrency(detailProduct.price)}</p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-blue-800">Cost Price</label>
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{formatCurrency(detailProduct.cost)}</p>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-purple-800">Profit Margin</label>
                              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-purple-900">
                              {Math.round(((detailProduct.price - detailProduct.cost) / detailProduct.price) * 100)}%
                            </p>
                            <p className="text-sm text-purple-600 mt-1">{formatCurrency(detailProduct.price - detailProduct.cost)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Stock & Status */}
                  <div className="space-y-6">
                    {/* Stock Information Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                          Stock Information
                        </h5>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Current Stock</label>
                            <Package className="h-4 w-4 text-gray-500" />
                          </div>
                          <p className="text-3xl font-bold text-gray-900">{formatNumber(detailProduct.quantity)}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Minimum Stock</span>
                              <span className="font-mono">{detailProduct.minStock}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className={`h-2 rounded-full ${detailProduct.quantity === 0 ? 'bg-red-500' :
                                  detailProduct.quantity <= detailProduct.minStock ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                style={{ width: `${Math.min((detailProduct.quantity / Math.max(detailProduct.minStock * 2, 1)) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-yellow-800">Reorder Point</label>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          </div>
                          <p className="text-xl font-bold text-yellow-900">{detailProduct.minStock} units</p>
                          <p className="text-xs text-yellow-600 mt-1">Alert when stock reaches this level</p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="h-2 w-2 bg-gray-600 rounded-full"></div>
                          Timestamps
                        </h5>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(detailProduct.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(detailProduct.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Product ID: {detailProduct.id}
                  </div>
                  <div className="flex items-center gap-3">
                    {hasPermission(['ADMIN', 'MANAGER']) && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDetailModal(false)
                            handleEditProduct(detailProduct)
                          }}
                          className="btn btn-primary"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDetailModal(false)
                            handleDeleteProduct(detailProduct)
                          }}
                          className="btn btn-danger"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Product
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(false)}
                      className="btn btn-outline"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
