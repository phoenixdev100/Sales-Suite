import { useState } from 'react'
import { Menu, Bell, Search, LogOut, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { cn } from '../utils/helpers'

export default function Topbar({ onMenuClick, sidebarCollapsed, setSidebarCollapsed }) {
  const { user, logout } = useAuth()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setProfileDropdownOpen(false)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        {/* Welcome message */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            Welcome to Sales Suite, {user?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
            Manage your inventory and sales efficiently
          </p>
        </div>

        <div className="flex items-center gap-x-3 sm:gap-x-4 lg:gap-x-6 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-6 w-6" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-danger-500 to-danger-600 text-xs text-white flex items-center justify-center shadow-lg shadow-danger-500/30">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-xl bg-white/95 backdrop-blur-xl py-2 shadow-2xl ring-1 ring-gray-900/5 focus:outline-none border border-gray-200/50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {/* Sample notifications */}
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-danger-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Wireless Headphones</span> is running low on stock
                        </p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-warning-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          New sale completed by <span className="font-medium">John Doe</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-success-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          Monthly sales target achieved!
                        </p>
                        <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-medium text-white shadow-lg shadow-primary-500/30">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </span>
            </button>

            {/* Profile dropdown menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-xl bg-white/95 backdrop-blur-xl py-2 shadow-2xl ring-1 ring-gray-900/5 focus:outline-none border border-gray-200/50">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(profileDropdownOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setProfileDropdownOpen(false)
            setNotificationsOpen(false)
          }}
        />
      )}
    </div>
  )
}
