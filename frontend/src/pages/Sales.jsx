import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Filter,
  Eye,
  ShoppingCart,
  Calendar,
  DollarSign,
  User,
  Package,
  ChevronDown
} from 'lucide-react'
import { salesAPI, usersAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency, formatNumber, formatDate, formatRelativeTime, getStatusColor, debounce } from '../utils/helpers'
import toast from 'react-hot-toast'
import SaleModal from '../components/SaleModal'

export default function Sales() {
  const { user, hasPermission } = useAuth()
  const [sales, setSales] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [soldByFilter, setSoldByFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSales, setTotalSales] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [salesStats, setSalesStats] = useState(null)

  // Custom dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [soldByDropdownOpen, setSoldByDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const statusDropdownRef = useRef(null)
  const soldByDropdownRef = useRef(null)
  const sortDropdownRef = useRef(null)

  // Frontend caching
  const [salesCache, setSalesCache] = useState(new Map())
  const [lastFetchTime, setLastFetchTime] = useState(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const limit = 10

  useEffect(() => {
    if (hasPermission(['ADMIN', 'MANAGER'])) {
      fetchUsers()
    }
    fetchSalesStats()
  }, [])

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false)
      }
      if (soldByDropdownRef.current && !soldByDropdownRef.current.contains(event.target)) {
        setSoldByDropdownOpen(false)
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

  useEffect(() => {
    const debouncedFetch = debounce(fetchSales, 300)
    debouncedFetch()
  }, [searchTerm, statusFilter, soldByFilter, dateFromFilter, dateToFilter, sortBy, sortOrder, currentPage])

  const fetchSales = async () => {
    try {
      setLoading(true)

      // Generate cache key based on filters
      const cacheKey = JSON.stringify({
        page: currentPage,
        limit,
        search: searchTerm,
        status: statusFilter,
        soldBy: soldByFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        sortBy,
        sortOrder
      })

      // Check cache first
      const now = Date.now()
      const cached = salesCache.get(cacheKey)
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setSales(cached.data.sales)
        setTotalPages(cached.data.pagination.pages)
        setTotalSales(cached.data.pagination.total)
        setLoading(false)
        return
      }

      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        status: statusFilter,
        soldBy: soldByFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        sortBy,
        sortOrder
      }

      const response = await salesAPI.getAll(params)
      const data = response.data

      // Update cache
      setSalesCache(prev => new Map(prev).set(cacheKey, {
        data,
        timestamp: now
      }))
      setLastFetchTime(now)

      setSales(data.sales)
      setTotalPages(data.pagination.pages)
      setTotalSales(data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch sales:', error)
      toast.error('Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll({ limit: 100 })
      setUsers(response.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchSalesStats = async () => {
    try {
      const response = await salesAPI.getStats({ period: '30' })
      setSalesStats(response.data)
    } catch (error) {
      console.error('Failed to fetch sales stats:', error)
    }
  }

  const handleAddSale = () => {
    setSelectedSale(null)
    setShowModal(true)
  }

  const handleViewSale = (sale) => {
    setSelectedSale(sale)
    setShowModal(true)
  }

  const handleSaleSaved = () => {
    setShowModal(false)
    setSelectedSale(null)
    // Clear cache when sale is saved
    setSalesCache(new Map())
    setLastFetchTime(null)
    fetchSales()
    fetchSalesStats()
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setSoldByFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const getStatusBadge = (status) => {
    const color = getStatusColor(status)
    return (
      <span className={`badge badge-${color}`}>
        {status.toLowerCase().replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600">Track and manage your sales transactions</p>
        </div>

        <button
          onClick={handleAddSale}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </button>
      </div>

      {/* Stats Cards */}
      {salesStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary-100">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue (30d)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesStats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success-100">
                <ShoppingCart className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales (30d)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(salesStats.totalSales)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning-100">
                <Package className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesStats.averageOrderValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="xl:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by sale number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusDropdownRef}>
            <div className="relative">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="truncate">
                  {statusFilter || 'All Status'}
                </span>
                <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="py-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => {
                        setStatusFilter('')
                        setStatusDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${!statusFilter ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('PENDING')
                        setStatusDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${statusFilter === 'PENDING' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('COMPLETED')
                        setStatusDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${statusFilter === 'COMPLETED' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('CANCELLED')
                        setStatusDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${statusFilter === 'CANCELLED' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                    >
                      Cancelled
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('REFUNDED')
                        setStatusDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${statusFilter === 'REFUNDED' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                    >
                      Refunded
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sold By Filter */}
          {hasPermission(['ADMIN', 'MANAGER']) && (
            <div className="relative" ref={soldByDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setSoldByDropdownOpen(!soldByDropdownOpen)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate">
                    {soldByFilter
                      ? users.find(u => u.id === soldByFilter)?.firstName + ' ' + users.find(u => u.id === soldByFilter)?.lastName
                      : 'All Salespeople'
                    }
                  </span>
                  <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${soldByDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {soldByDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSoldByFilter('')
                          setSoldByDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${!soldByFilter ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        All Salespeople
                      </button>
                      {users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSoldByFilter(user.id)
                            setSoldByDropdownOpen(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${soldByDropdownOpen === user.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                            }`}
                        >
                          {user.firstName} {user.lastName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date Range and Sort */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="relative" ref={sortDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate">
                    {sortBy === 'createdAt' && sortOrder === 'desc' && 'Newest First'}
                    {sortBy === 'createdAt' && sortOrder === 'asc' && 'Oldest First'}
                    {sortBy === 'finalAmount' && sortOrder === 'desc' && 'Highest Amount'}
                    {sortBy === 'finalAmount' && sortOrder === 'asc' && 'Lowest Amount'}
                    {sortBy === 'saleNumber' && sortOrder === 'asc' && 'Sale Number A-Z'}
                    {sortBy === 'saleNumber' && sortOrder === 'desc' && 'Sale Number Z-A'}
                  </span>
                  <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1 max-h-48 overflow-y-auto">
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
                      <button
                        onClick={() => {
                          setSortBy('finalAmount')
                          setSortOrder('desc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'finalAmount' && sortOrder === 'desc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Highest Amount
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('finalAmount')
                          setSortOrder('asc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'finalAmount' && sortOrder === 'asc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Lowest Amount
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('saleNumber')
                          setSortOrder('asc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'saleNumber' && sortOrder === 'asc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Sale Number A-Z
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('saleNumber')
                          setSortOrder('desc')
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-left ${sortBy === 'saleNumber' && sortOrder === 'desc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                      >
                        Sale Number Z-A
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="btn btn-outline w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || statusFilter || soldByFilter || dateFromFilter || dateToFilter) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="badge badge-primary">
                Search: "{searchTerm}"
              </span>
            )}
            {statusFilter && (
              <span className="badge badge-primary">
                Status: {statusFilter}
              </span>
            )}
            {soldByFilter && (
              <span className="badge badge-primary">
                Sold by: {users.find(u => u.id === soldByFilter)?.firstName} {users.find(u => u.id === soldByFilter)?.lastName}
              </span>
            )}
            {dateFromFilter && (
              <span className="badge badge-primary">
                From: {formatDate(dateFromFilter)}
              </span>
            )}
            {dateToFilter && (
              <span className="badge badge-primary">
                To: {formatDate(dateToFilter)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sales ({formatNumber(totalSales)})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter || soldByFilter || dateFromFilter || dateToFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first sale.'}
            </p>
            <button onClick={handleAddSale} className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sale Details</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Sold By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{sale.saleNumber}</p>
                            <p className="text-sm text-gray-600">
                              {sale.saleItems?.length || 0} items
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">
                            {sale.customerName || 'Walk-in Customer'}
                          </p>
                          {sale.customerEmail && (
                            <p className="text-sm text-gray-600">{sale.customerEmail}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(sale.finalAmount)}
                          </p>
                          {sale.discount > 0 && (
                            <p className="text-sm text-gray-600">
                              Discount: {formatCurrency(sale.discount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(sale.status)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {sale.soldBy?.firstName?.charAt(0)}{sale.soldBy?.lastName?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900">
                            {sale.soldBy?.firstName} {sale.soldBy?.lastName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm text-gray-900">
                            {formatDate(sale.createdAt)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatRelativeTime(sale.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewSale(sale)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="View sale details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalSales)} of {totalSales} sales
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 text-sm rounded-lg ${currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sale Modal */}
      {showModal && (
        <SaleModal
          sale={selectedSale}
          onClose={() => setShowModal(false)}
          onSave={handleSaleSaved}
        />
      )}
    </div>
  )
}
