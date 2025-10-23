import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchSalesAnalytics()
  }, [period])

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

  const fetchSalesAnalytics = async () => {
    try {
      const response = await dashboardAPI.getSalesAnalytics({ period })
      setSalesAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch sales analytics:', error)
    }
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === "increase" && (
                    <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
                  )}
                  {stat.changeType === "decrease" && (
                    <TrendingDown className="h-4 w-4 text-danger-600 mr-1" />
                  )}
                  {stat.changeType === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-warning-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    stat.changeType === "increase" ? "text-success-600" :
                    stat.changeType === "decrease" ? "text-danger-600" :
                    stat.changeType === "warning" ? "text-warning-600" :
                    "text-gray-600"
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${
                stat.color === "success" ? "bg-success-100" :
                stat.color === "primary" ? "bg-primary-100" :
                stat.color === "warning" ? "bg-warning-100" :
                "bg-gray-100"
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === "success" ? "text-success-600" :
                  stat.color === "primary" ? "text-primary-600" :
                  stat.color === "warning" ? "text-warning-600" :
                  "text-gray-600"
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span>Sales Count</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesAnalytics?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
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
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
            <Link to="/app/reports" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <Eye className="h-4 w-4" />
              View Details
            </Link>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesAnalytics?.categoryPerformance || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="totalRevenue"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {(salesAnalytics?.categoryPerformance || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <Link to="/app/sales" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentSales?.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sale.saleNumber}</p>
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
          <div className="flex items-center justify-between mb-6">
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
                <div className="text-right">
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
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-warning-600 mt-0.5" />
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
                View Low Stock Products
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
