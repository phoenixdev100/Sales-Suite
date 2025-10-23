import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getRoleColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    }
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm()

  const newPassword = watch('newPassword')

  const onProfileSubmit = async (data) => {
    setProfileLoading(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        resetProfile(data)
      }
    } finally {
      setProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true)
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      if (result.success) {
        resetPassword()
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'permissions', name: 'Permissions', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-xl font-bold text-white">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
              user?.role === 'ADMIN' ? 'bg-danger-100 text-danger-800' :
              user?.role === 'MANAGER' ? 'bg-warning-100 text-warning-800' :
              'bg-primary-100 text-primary-800'
            }`}>
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <p className="text-gray-600">Update your personal information and contact details</p>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...registerProfile('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'First name must be at least 2 characters' }
                      })}
                      type="text"
                      className="input"
                      placeholder="Enter your first name"
                    />
                    {profileErrors.firstName && (
                      <p className="mt-1 text-sm text-danger-600">{profileErrors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...registerProfile('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                      })}
                      type="text"
                      className="input"
                      placeholder="Enter your last name"
                    />
                    {profileErrors.lastName && (
                      <p className="mt-1 text-sm text-danger-600">{profileErrors.lastName.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...registerProfile('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input"
                      placeholder="Enter your email"
                    />
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-danger-600">{profileErrors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn btn-primary"
                  >
                    {profileLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="card">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <p className="text-gray-600">Update your password to keep your account secure</p>
                </div>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('currentPassword', {
                          required: 'Current password is required'
                        })}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('newPassword', {
                          required: 'New password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: value => value === newPassword || 'Passwords do not match'
                      })}
                      type="password"
                      className="input"
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="btn btn-primary"
                    >
                      {passwordLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Tips */}
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Security Tips</h4>
                    <ul className="mt-2 text-sm text-blue-800 space-y-1">
                      <li>• Use a strong password with at least 8 characters</li>
                      <li>• Include uppercase, lowercase, numbers, and special characters</li>
                      <li>• Don't reuse passwords from other accounts</li>
                      <li>• Change your password regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-gray-600">Choose what notifications you want to receive</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Low Stock Alerts</p>
                        <p className="text-sm text-gray-600">Get notified when products are running low</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Sales Reports</p>
                        <p className="text-sm text-gray-600">Weekly sales summary reports</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">System Updates</p>
                        <p className="text-sm text-gray-600">Important system announcements</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">New Sales</p>
                        <p className="text-sm text-gray-600">Get notified of new sales transactions</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Critical Alerts</p>
                        <p className="text-sm text-gray-600">Important system alerts and errors</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="btn btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="card">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Account Permissions</h3>
                <p className="text-gray-600">Your current role and permissions in the system</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <Shield className="h-8 w-8 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Current Role</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                      user?.role === 'ADMIN' ? 'bg-danger-100 text-danger-800' :
                      user?.role === 'MANAGER' ? 'bg-warning-100 text-warning-800' :
                      'bg-primary-100 text-primary-800'
                    }`}>
                      {user?.role?.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Permissions</h4>
                  
                  <div className="space-y-3">
                    {user?.role === 'ADMIN' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Full system access</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">User management</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Product management</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Sales management</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Financial reports</span>
                        </div>
                      </>
                    )}

                    {user?.role === 'MANAGER' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Product management</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Sales management</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Financial reports</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-500">User management (limited)</span>
                        </div>
                      </>
                    )}

                    {user?.role === 'SALESPERSON' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">Create sales</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">View products</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                          <span className="text-gray-900">View own sales</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-500">Product management (read-only)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="card bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Need Different Permissions?</h4>
                      <p className="mt-1 text-sm text-yellow-800">
                        Contact your system administrator to request role changes or additional permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
