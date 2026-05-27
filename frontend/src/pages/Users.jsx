import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Users as UsersIcon,
  Shield,
  Mail,
  Calendar
} from 'lucide-react'
import { usersAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatRelativeTime, getRoleColor, debounce, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'
import UserModal from '../components/UserModal'

// Frontend caching variables in module scope to persist across page navigations
const usersCache = new Map()
let lastFetchTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function Users() {
  const { hasPermission } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [userStats, setUserStats] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const limit = 10

  // Redirect if not admin
  if (!hasPermission(['ADMIN'])) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  useEffect(() => {
    fetchUserStats()
  }, [])

  useEffect(() => {
    const debouncedFetch = debounce(fetchUsers, 300)
    debouncedFetch()
  }, [searchTerm, roleFilter, statusFilter, sortBy, sortOrder, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const cacheKey = JSON.stringify({
        page: currentPage,
        limit,
        search: searchTerm,
        role: roleFilter,
        isActive: statusFilter
      })

      // Check cache first
      const now = Date.now()
      const cached = usersCache.get(cacheKey)
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setUsers(cached.data.users)
        setTotalPages(cached.data.pagination.pages)
        setTotalUsers(cached.data.pagination.total)
        setLoading(false)
        return
      }

      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        role: roleFilter,
        isActive: statusFilter
      }

      const response = await usersAPI.getAll(params)
      const data = response.data

      // Update cache
      usersCache.set(cacheKey, {
        data,
        timestamp: now
      })
      lastFetchTime = now

      setUsers(data.users)
      setTotalPages(data.pagination.pages)
      setTotalUsers(data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await usersAPI.getStats()
      setUserStats(response.data)
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      await usersAPI.activate(userId)
      toast.success('User activated successfully')
      usersCache.clear()
      lastFetchTime = null
      fetchUsers()
      fetchUserStats()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to activate user'
      toast.error(message)
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      await usersAPI.deactivate(userId)
      toast.success('User deactivated successfully')
      usersCache.clear()
      lastFetchTime = null
      fetchUsers()
      fetchUserStats()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to deactivate user'
      toast.error(message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await usersAPI.delete(userId)
      toast.success('User deleted successfully')
      usersCache.clear()
      lastFetchTime = null
      fetchUsers()
      fetchUserStats()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete user'
      toast.error(message)
    }
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleUserSaved = () => {
    setShowModal(false)
    setSelectedUser(null)
    usersCache.clear()
    lastFetchTime = null
    fetchUsers()
    fetchUserStats()
  }

  const resetFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
    setStatusFilter('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const getRoleBadge = (role) => {
    const color = getRoleColor(role)
    return (
      <span className={`badge badge-${color}`}>
        {role.toLowerCase()}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={handleAddUser}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary-100">
                <UsersIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success-100">
                <UserCheck className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-100">
                <UserX className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.inactiveUsers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning-100">
                <Shield className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.usersByRole?.find(r => r.role === 'ADMIN')?._count?.id || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="select-input"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="SALESPERSON">Salesperson</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-input"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full lg:w-48">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="select-input"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="firstName-asc">Name A-Z</option>
              <option value="firstName-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="btn btn-outline whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>

        {/* Active Filters */}
        {(searchTerm || roleFilter || statusFilter) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="badge badge-primary">
                Search: "{searchTerm}"
              </span>
            )}
            {roleFilter && (
              <span className="badge badge-primary">
                Role: {roleFilter}
              </span>
            )}
            {statusFilter && (
              <span className="badge badge-primary">
                Status: {statusFilter === 'true' ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({totalUsers})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter || statusFilter
                ? 'Try adjusting your filters to see more results.'
                : 'No users have been created yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Sales Count</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getRoleBadge(user.role)}
                      </td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-gray'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <p className="font-medium text-gray-900">
                          {user._count?.sales || 0}
                        </p>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.createdAt)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatRelativeTime(user.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              className="p-1 text-gray-400 hover:text-warning-600"
                              title="Deactivate user"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              className="p-1 text-gray-400 hover:text-success-600"
                              title="Activate user"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-gray-400 hover:text-danger-600"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3 p-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600 flex-shrink-0">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {getRoleBadge(user.role)}
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-gray'} text-[10px] px-2 py-0.5`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-gray-500 font-medium">Sales Count</p>
                      <p className="font-bold text-gray-900 mt-0.5">{user._count?.sales || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Joined</p>
                      <p className="text-gray-900 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => handleDeactivateUser(user.id)}
                        className="p-2 text-gray-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                        title="Deactivate user"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateUser(user.id)}
                        className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                        title="Activate user"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
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
                          className={`w-8 h-8 text-sm rounded-lg ${
                            currentPage === pageNum
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

      {/* Top Salespeople */}
      {userStats?.topSalespeople && userStats.topSalespeople.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Salespeople (Last 30 Days)</h3>
          </div>
          <div className="space-y-4">
            {userStats.topSalespeople.map((salesperson, index) => (
              <div key={salesperson.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600">
                    {index + 1}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center text-sm font-medium text-success-600">
                    {salesperson.name.split(' ').map(n => n.charAt(0)).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{salesperson.name}</p>
                    <p className="text-sm text-gray-600">{salesperson.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{salesperson.salesCount} sales</p>
                  <p className="text-sm text-gray-600">{formatCurrency(salesperson.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleUserSaved}
        />
      )}
    </div>
  )
}
