import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../utils/helpers'

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/app/products', icon: Package },
  { name: 'Sales', href: '/app/sales', icon: ShoppingCart },
  { name: 'Reports', href: '/app/reports', icon: FileText },
  { name: 'Users', href: '/app/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Settings', href: '/app/settings', icon: Settings },
]

export default function Sidebar({ open, setOpen, collapsed, setCollapsed }) {
  const location = useLocation()
  const { hasPermission } = useAuth()

  const filteredNavigation = navigation.filter(item =>
    !item.roles || hasPermission(item.roles)
  )

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
        collapsed ? "lg:w-20" : "lg:w-72"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 shrink-0 flex-col items-center pt-4">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sales Suite</h1>
                  <p className="text-sm text-gray-500">Inventory Management</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col mt-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className={cn(
                  "space-y-1",
                  collapsed ? "-mx-2" : "-mx-2"
                )}>
                  {filteredNavigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex items-center rounded-lg transition-all duration-200',
                            collapsed
                              ? 'justify-center px-3 py-3'
                              : 'gap-x-3 px-3 py-2.5',
                            isActive
                              ? 'bg-primary-50 text-primary-600 border border-primary-200'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          )}
                          title={collapsed ? item.name : undefined}
                        >
                          <item.icon className={cn(
                            'h-5 w-5 shrink-0 transition-colors flex-shrink-0',
                            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                          )} />
                          {!collapsed && <span className="text-sm font-medium flex-1">{item.name}</span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>

              {/* Low stock alert - moved to bottom */}
              <li className="mt-auto">
                {!collapsed ? (
                  <div className="rounded-xl bg-warning-50 border border-warning-200 p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-warning-800">
                          Low Stock Alert
                        </h3>
                        <p className="text-xs text-warning-700 mt-1">
                          Some products are running low. Check your inventory.
                        </p>
                        <Link
                          to="/app/products?lowStock=true"
                          className="text-xs font-medium text-warning-800 hover:text-warning-900 mt-2 inline-block transition-colors"
                        >
                          View Products →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center mb-4">
                    <div className="rounded-xl bg-warning-50 border border-warning-200 p-3">
                      <AlertTriangle className="h-5 w-5 text-warning-600" />
                    </div>
                  </div>
                )}

                {/* Collapse button - moved to very bottom */}
                <div className="flex justify-center">
                  <button
                    onClick={toggleCollapse}
                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {collapsed ? (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "relative z-50 lg:hidden",
        open ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              {/* Mobile logo */}
              <div className="flex h-16 shrink-0 items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Sales Suite</h1>
                  </div>
                </div>
              </div>

              {/* Mobile navigation */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {filteredNavigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                'group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              <item.icon className={cn(
                                'h-5 w-5 shrink-0 transition-colors',
                                isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                              )} />
                              {item.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </li>

                  {/* Low stock alert - mobile bottom */}
                  <li className="mt-auto">
                    <div className="rounded-xl bg-warning-50 border border-warning-200 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-warning-800">
                            Low Stock Alert
                          </h3>
                          <p className="text-xs text-warning-700 mt-1">
                            Some products are running low. Check your inventory.
                          </p>
                          <Link
                            to="/app/products?lowStock=true"
                            className="text-xs font-medium text-warning-800 hover:text-warning-900 mt-2 inline-block transition-colors"
                          >
                            View Products →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
