import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 sm:py-8 sm:px-6 lg:px-8 relative">
      {/* Back to homepage - left side */}
      <Link
        to="/"
        className="absolute left-4 top-4 sm:left-8 sm:top-8 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span className="hidden sm:inline">Back to Homepage</span>
      </Link>

      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
            <LayoutDashboard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Welcome back to Sales Suite
          </p>
        </div>

        {/* Demo credentials */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 sm:p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
          <div className="text-xs sm:text-sm text-blue-700 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-medium">Admin:</span>
              <span className="font-mono">admin@example.com / admin123</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-medium">Manager:</span>
              <span className="font-mono">manager@example.com / manager123</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-medium">Sales:</span>
              <span className="font-mono">sales@example.com / sales123</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
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
                autoComplete="email"
                className="input text-sm sm:text-base"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pr-10 text-sm sm:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Remember me and forgot password */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm text-center sm:text-right">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-sm sm:text-base py-3 sm:py-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">Signing in...</span>
                  <span className="sm:hidden">Signing...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                <span className="hidden sm:inline">Sign up here</span>
                <span className="sm:hidden">Sign up</span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
