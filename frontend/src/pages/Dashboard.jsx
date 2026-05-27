import { useState, useEffect, useRef } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Eye
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { dashboardAPI } from '../utils/api'
import { formatCurrency, formatNumber, formatRelativeTime, generateColors } from '../utils/helpers'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [salesAnalytics, setSalesAnalytics] = useState(null)
  const [inventoryAnalytics, setInventoryAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [analyticsFetched, setAnalyticsFetched] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (!analyticsFetched) {
      fetchSalesAnalytics()
      setAnalyticsFetched(true)
    }
  }, [period, analyticsFetched])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Debounced function to prevent excessive API calls
  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const fetchSalesAnalytics = async () => {
    try {
      const response = await dashboardAPI.getSalesAnalytics({ period })
      setSalesAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch sales analytics:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, inventoryRes] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getInventoryAnalytics()
      ])

      setDashboardData(overviewRes.data)
      setInventoryAnalytics(inventoryRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced fetch functions to prevent excessive requests
  const debouncedFetchSalesAnalytics = debounce(fetchSalesAnalytics, 500)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(dashboardData?.summary?.today?.revenue || 0),
      change: "+12.5%",
      changeType: "increase",
      icon: DollarSign,
      color: "success"
    },
    {
      title: "Today's Sales",
      value: formatNumber(dashboardData?.summary?.today?.sales || 0),
      change: "+8.2%",
      changeType: "increase",
      icon: ShoppingCart,
      color: "primary"
    },
    {
      title: "Total Products",
      value: formatNumber(dashboardData?.inventory?.totalProducts || 0),
      change: `${dashboardData?.inventory?.lowStockProducts || 0} low stock`,
      changeType: dashboardData?.inventory?.lowStockProducts > 0 ? "warning" : "neutral",
      icon: Package,
      color: "warning"
    },
    {
      title: "Active Users",
      value: formatNumber(dashboardData?.users?.total || 0),
      change: "All systems operational",
      changeType: "neutral",
      icon: Users,
      color: "gray"
    }
  ]

  const chartColors = generateColors(10)

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="w-full sm:w-auto relative" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 text-sm sm:text-base flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span>{period === '7' ? 'Last 7 days' : period === '30' ? 'Last 30 days' : 'Last 90 days'}</span>
              <svg
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setPeriod('7')
                      setIsDropdownOpen(false)
                      setAnalyticsFetched(false)
                      // Use debounced function to prevent excessive requests
                      setTimeout(() => debouncedFetchSalesAnalytics(), 100)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm sm:text-base hover:bg-gray-100 transition-colors ${period === '7' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => {
                      setPeriod('30')
                      setIsDropdownOpen(false)
                      setAnalyticsFetched(false)
                      // Use debounced function to prevent excessive requests
                      setTimeout(() => debouncedFetchSalesAnalytics(), 100)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm sm:text-base hover:bg-gray-100 transition-colors ${period === '30' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => {
                      setPeriod('90')
                      setIsDropdownOpen(false)
                      setAnalyticsFetched(false)
                      // Use debounced function to prevent excessive requests
                      setTimeout(() => debouncedFetchSalesAnalytics(), 100)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm sm:text-base hover:bg-gray-100 transition-colors ${period === '90' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                  >
                    Last 90 days
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center ${stat.color === "success" ? "bg-success-100 text-success-600" :
                stat.color === "primary" ? "bg-primary-100 text-primary-600" :
                  stat.color === "warning" ? "bg-warning-100 text-warning-600" :
                    "bg-gray-100 text-gray-600"
                }`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.changeType === "increase" && (
                <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
              )}
              {stat.changeType === "decrease" && (
                <TrendingDown className="h-4 w-4 text-danger-600 mr-1" />
              )}
              {stat.changeType === "warning" && (
                <AlertTriangle className="h-4 w-4 text-warning-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${stat.changeType === "increase" ? "text-success-600" :
                stat.changeType === "decrease" ? "text-danger-600" :
                  stat.changeType === "warning" ? "text-warning-600" :
                    "text-gray-500"
                }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sales Trend</h3>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary-500 rounded-full"></div>
                <span className="hidden sm:inline">Revenue</span>
                <span className="sm:hidden">Rev</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-success-500 rounded-full"></div>
                <span className="hidden sm:inline">Sales Count</span>
                <span className="sm:hidden">Sales</span>
              </div>
            </div>
          </div>
          <div className="h-48 sm:h-64 md:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesAnalytics?.salesTrend || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={9}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#64748b" fontSize={9} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                    name === 'revenue' ? 'Revenue' : 'Sales'
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={1.5}
                  dot={{ fill: '#0ea5e9', strokeWidth: 1.5, r: 2 }}
                  activeDot={{ r: 4, stroke: '#0ea5e9', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={{ fill: '#10b981', strokeWidth: 1.5, r: 2 }}
                  activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="card min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Category Performance</h3>
            <Link to="/app/reports" className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </Link>
          </div>
          <div className="h-48 sm:h-64 md:h-72 lg:h-80">
            {salesAnalytics?.categoryPerformance && salesAnalytics.categoryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesAnalytics.categoryPerformance}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={25}
                    dataKey="totalRevenue"
                    label={false}
                    labelLine={false}
                  >
                    {salesAnalytics.categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => {
                      const displayName = windowWidth < 640 && value.length > 10 ? `${value.substring(0, 8)}...` : value;
                      return displayName;
                    }}
                    wrapperStyle={{
                      fontSize: windowWidth < 640 ? '10px' : '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Package className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 text-center">No category data available</p>
                <p className="text-xs text-gray-400 text-center mt-1">Sales data will appear here once available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="xl:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <Link to="/app/sales" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentSales?.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{sale.saleNumber}</p>
                      <p className="text-sm text-gray-600">
                        {sale.customerName || 'Walk-in Customer'} • {sale.soldBy}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(sale.finalAmount)}</p>
                  <p className="text-sm text-gray-600">{formatRelativeTime(sale.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <Link to="/app/products" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData?.topProducts?.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">{product.totalSold} sold</p>
                  <p className="text-xs text-gray-600">{formatCurrency(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {dashboardData?.inventory?.lowStockProducts > 0 && (
        <div className="card bg-warning-50 border-warning-200">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-warning-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-warning-800">
                Low Stock Alert
              </h3>
              <p className="text-warning-700 mt-1">
                {dashboardData.inventory.lowStockProducts} products are running low on stock.
                Consider restocking to avoid stockouts.
              </p>
              <Link
                to="/app/products?lowStock=true"
                className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-warning-800 hover:text-warning-900"
              >
                <span className="hidden sm:inline">View Low Stock Products</span>
                <span className="sm:hidden">View Products</span>
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
