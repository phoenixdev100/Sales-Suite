import { Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Homepage() {
  const features = [
    {
      icon: LayoutDashboard,
      title: 'Comprehensive Dashboard',
      description: 'Get real-time insights with interactive charts and analytics to track your business performance.'
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Manage your products, track stock levels, and get automated low-stock alerts.'
    },
    {
      icon: ShoppingCart,
      title: 'Sales Tracking',
      description: 'Record transactions, manage customers, and monitor sales performance in real-time.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Reports',
      description: 'Generate detailed reports with CSV export for sales, inventory, and profit analysis.'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Role-based access control with Admin, Manager, and Salesperson permissions.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Built with modern security practices and reliable data protection.'
    }
  ]

  const benefits = [
    'Real-time inventory tracking',
    'Automated low-stock alerts',
    'Comprehensive sales analytics',
    'Multi-user role management',
    'Export reports to CSV',
    'Responsive design for all devices'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Sales Suite</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Manage Your Business with
              <span className="text-primary-600 block">Smart Analytics</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A comprehensive inventory and sales management system designed for modern businesses. 
              Track inventory, manage sales, and get insights that drive growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="btn btn-outline text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Try the Demo</h2>
            <p className="text-gray-600">Use these demo accounts to explore all features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-blue-200">
              <div className="text-center">
                <div className="h-12 w-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-danger-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin Access</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Email: admin@example.com</p>
                  <p className="text-gray-600">Password: admin123</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">Full system access & user management</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-blue-200">
              <div className="text-center">
                <div className="h-12 w-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-warning-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manager Access</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Email: manager@example.com</p>
                  <p className="text-gray-600">Password: manager123</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">Product & sales management</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-blue-200">
              <div className="text-center">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sales Access</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Email: sales@example.com</p>
                  <p className="text-gray-600">Password: sales123</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">Create sales & view products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From inventory tracking to sales analytics, our platform provides all the tools 
              you need to run your business efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built with modern technology and designed for businesses of all sizes. 
                Get started in minutes and scale as you grow.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-soft">
                  <TrendingUp className="h-8 w-8 text-success-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Sales Growth</h4>
                  <p className="text-sm text-gray-600">Track and optimize your sales performance</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-soft">
                  <Zap className="h-8 w-8 text-warning-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Fast Setup</h4>
                  <p className="text-sm text-gray-600">Get up and running in minutes</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-soft">
                  <Globe className="h-8 w-8 text-primary-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Cloud Based</h4>
                  <p className="text-sm text-gray-600">Access from anywhere, anytime</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-soft">
                  <Shield className="h-8 w-8 text-danger-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Secure</h4>
                  <p className="text-sm text-gray-600">Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses already using our platform to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Sales Suite</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 phoenixdev100. Built with modern technology for modern businesses.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
