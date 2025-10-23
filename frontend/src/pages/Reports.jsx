import { useState, useEffect } from 'react'
import { 
  Download, 
  FileText, 
  Calendar, 
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { reportsAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency, formatNumber, formatDate, generateColors } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Reports() {
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('sales')
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [salesData, setSalesData] = useState(null)
  const [inventoryData, setInventoryData] = useState(null)
  const [profitData, setProfitData] = useState(null)

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setDateTo(today.toISOString().split('T')[0])
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchReports()
    }
  }, [activeTab, dateFrom, dateTo])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = { dateFrom, dateTo }
      
      switch (activeTab) {
        case 'sales':
          const salesResponse = await reportsAPI.getSales(params)
          setSalesData(salesResponse.data)
          break
        case 'inventory':
          const inventoryResponse = await reportsAPI.getInventory()
          setInventoryData(inventoryResponse.data)
          break
        case 'profit':
          if (hasPermission(['ADMIN', 'MANAGER'])) {
            const profitResponse = await reportsAPI.getProfit(params)
            setProfitData(profitResponse.data)
          }
          break
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (format) => {
    try {
      const params = { dateFrom, dateTo, format }
      let response
      
      switch (activeTab) {
        case 'sales':
          response = await reportsAPI.getSales(params)
          break
        case 'inventory':
          response = await reportsAPI.getInventory({ format })
          break
        case 'profit':
          if (hasPermission(['ADMIN', 'MANAGER'])) {
            response = await reportsAPI.getProfit(params)
          }
          break
      }
      
      if (response) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${activeTab}_report_${dateFrom}_to_${dateTo}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success('Report downloaded successfully')
      }
    } catch (error) {
      console.error('Failed to download report:', error)
      toast.error('Failed to download report')
    }
  }

  const tabs = [
    { id: 'sales', name: 'Sales Report', icon: TrendingUp },
    { id: 'inventory', name: 'Inventory Report', icon: Package },
    ...(hasPermission(['ADMIN', 'MANAGER']) ? [
      { id: 'profit', name: 'Profit Analysis', icon: DollarSign }
    ] : [])
  ]

  const chartColors = generateColors(10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and export detailed business reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Date Range and Export */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => downloadReport('csv')}
              className="btn btn-outline"
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {activeTab === 'sales' && salesData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-100">
                      <TrendingUp className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(salesData.summary?.totalSales || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success-100">
                      <DollarSign className="h-6 w-6 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(salesData.summary?.totalRevenue || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-warning-100">
                      <BarChart3 className="h-6 w-6 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(salesData.summary?.averageOrderValue || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Trend Chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData.groupedData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="period" 
                        stroke="#64748b"
                        fontSize={12}
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
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0ea5e9" 
                        strokeWidth={3}
                        dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {activeTab === 'inventory' && inventoryData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-100">
                      <Package className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(inventoryData.summary?.totalProducts || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success-100">
                      <DollarSign className="h-6 w-6 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(inventoryData.summary?.totalValue || 0)}
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
                      <p className="text-sm font-medium text-gray-600">Low Stock</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(inventoryData.summary?.lowStockItems || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-danger-100">
                      <Package className="h-6 w-6 text-danger-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(inventoryData.summary?.outOfStockItems || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Inventory Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Min Stock</th>
                        <th>Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.products?.slice(0, 10).map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.sku}</p>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-gray">
                              {product.category?.name}
                            </span>
                          </td>
                          <td>
                            <p className="font-medium text-gray-900">
                              {formatNumber(product.quantity)}
                            </p>
                          </td>
                          <td>
                            <p className="text-gray-600">
                              {formatNumber(product.minStock)}
                            </p>
                          </td>
                          <td>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(product.cost * product.quantity)}
                            </p>
                          </td>
                          <td>
                            <span className={`badge ${
                              product.quantity === 0 ? 'badge-danger' :
                              product.quantity <= product.minStock ? 'badge-warning' :
                              'badge-success'
                            }`}>
                              {product.quantity === 0 ? 'Out of Stock' :
                               product.quantity <= product.minStock ? 'Low Stock' :
                               'In Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Profit Report */}
          {activeTab === 'profit' && profitData && hasPermission(['ADMIN', 'MANAGER']) && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success-100">
                      <DollarSign className="h-6 w-6 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(profitData.summary?.totalRevenue || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-warning-100">
                      <DollarSign className="h-6 w-6 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(profitData.summary?.totalCost || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-100">
                      <TrendingUp className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Profit</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(profitData.summary?.totalProfit || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gray-100">
                      <PieChart className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(profitData.summary?.overallMargin || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profit Analysis</h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitData.profitData?.slice(0, 20) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="saleNumber" 
                        stroke="#64748b"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                          formatCurrency(value),
                          name === 'revenue' ? 'Revenue' : 
                          name === 'cost' ? 'Cost' : 'Profit'
                        ]}
                      />
                      <Bar dataKey="revenue" fill="#0ea5e9" />
                      <Bar dataKey="cost" fill="#f59e0b" />
                      <Bar dataKey="profit" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
