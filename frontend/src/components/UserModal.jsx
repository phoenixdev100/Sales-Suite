import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { X, UserPlus, ChevronDown } from 'lucide-react'
import { usersAPI } from '../utils/api'
import toast from 'react-hot-toast'

export default function UserModal({ user, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const roleDropdownRef = useRef(null)

  const isEditing = !!user

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'SALESPERSON'
    }
  })

  const watchRole = watch('role')

  // Register role field programmatically
  useEffect(() => {
    register('role', { required: 'Role is required' })
  }, [register])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '')
      setValue('lastName', user.lastName || '')
      setValue('email', user.email || '')
      setValue('role', user.role || 'SALESPERSON')
    }
  }, [user, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEditing) {
        // Strip out password for update if empty
        const { password, ...updateData } = data
        await usersAPI.update(user.id, updateData)
        toast.success('User updated successfully')
      } else {
        await usersAPI.create(data)
        toast.success('User created successfully')
      }
      onSave()
    } catch (error) {
      const message = error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} user`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'SALESPERSON', label: 'Salesperson' }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit User Profile' : 'Add New User'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditing ? 'Update user roles and account details' : 'Create a new account with custom role'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  type="text"
                  className="input"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  type="text"
                  className="input"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input"
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password - Required only on create */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className="input"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Role Select Dropdown */}
            <div className="relative" ref={roleDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="w-full flex items-center justify-between h-10 px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-900">
                  {roles.find(r => r.value === watchRole)?.label || 'Select role'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="py-1">
                    {roles.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          setValue('role', role.value)
                          setRoleDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors ${watchRole === role.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Saving...' : 'Creating...'}
                  </div>
                ) : (
                  isEditing ? 'Save Changes' : 'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
