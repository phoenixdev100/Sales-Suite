import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format number with commas
export function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number)
}

// Format percentage
export function formatPercentage(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`
}

// Format date
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return ''
  return format(new Date(date), formatStr)
}

// Format date with time
export function formatDateTime(date) {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

// Format relative time
export function formatRelativeTime(date) {
  if (!date) return ''
  const dateObj = new Date(date)
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

// Truncate text
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Generate random color for charts
export function generateColors(count) {
  const colors = [
    '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
    '#14b8a6', '#eab308', '#dc2626', '#9333ea', '#0891b2'
  ]
  
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

// Debounce function
export function debounce(func, wait) {
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

// Get status color
export function getStatusColor(status) {
  const statusColors = {
    COMPLETED: 'success',
    PENDING: 'warning',
    CANCELLED: 'danger',
    REFUNDED: 'gray',
    ACTIVE: 'success',
    INACTIVE: 'gray',
    LOW_STOCK: 'warning',
    OUT_OF_STOCK: 'danger',
    IN_STOCK: 'success',
  }
  
  return statusColors[status] || 'gray'
}

// Get role color
export function getRoleColor(role) {
  const roleColors = {
    ADMIN: 'danger',
    MANAGER: 'warning',
    SALESPERSON: 'primary',
  }
  
  return roleColors[role] || 'gray'
}

// Calculate percentage change
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Download file
export function downloadFile(data, filename, type = 'text/csv') {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate SKU
export function generateSKU(productName, category) {
  const nameCode = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3)
  
  const categoryCode = category
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 2)
  
  const timestamp = Date.now().toString().slice(-4)
  
  return `${categoryCode}${nameCode}${timestamp}`
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get initials from name
export function getInitials(firstName, lastName) {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

// Sort array by key
export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

// Group array by key
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}
