import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { X, Plus, Trash2, ShoppingCart, Search, Calculator } from 'lucide-react'
import { salesAPI, productsAPI } from '../utils/api'
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function SaleModal({ sale, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  
  const isViewing = !!sale
  const isEditing = false // For now, we only support viewing existing sales

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset
  } = useForm({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      paymentMethod: 'Cash',
      discount: 0,
      tax: 0,
      notes: '',
      items: [{ productId: '', quantity: 1, price: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const watchedItems = watch('items')
  const watchedDiscount = watch('discount') || 0
  const watchedTax = watch('tax') || 0

  useEffect(() => {
    if (sale) {
      // Populate form with existing sale data
      setValue('customerName', sale.customerName || '')
      setValue('customerEmail', sale.customerEmail || '')
      setValue('customerPhone', sale.customerPhone || '')
      setValue('paymentMethod', sale.paymentMethod || 'Cash')
      setValue('discount', sale.discount || 0)
      setValue('tax', sale.tax || 0)
      setValue('notes', sale.notes || '')
      
      if (sale.saleItems) {
        setValue('items', sale.saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.product?.name,
          productSku: item.product?.sku
        })))
      }
    } else {
      fetchProducts()
    }
  }, [sale, setValue])

  const fetchProducts = async (search = '') => {
    try {
      const response = await productsAPI.getAll({ 
        search, 
        limit: 20,
        isActive: true 
      })
      setProducts(response.data.products)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleProductSearch = (search) => {
    setSearchTerm(search)
    if (search.length > 2) {
      fetchProducts(search)
    }
  }

  const addProduct = (product) => {
    const existingIndex = watchedItems.findIndex(item => item.productId === product.id)
    
    if (existingIndex >= 0) {
      // Increase quantity if product already exists
      const currentQuantity = watchedItems[existingIndex].quantity
      setValue(`items.${existingIndex}.quantity`, currentQuantity + 1)
    } else {
      // Add new product
      append({
        productId: product.id,
        quantity: 1,
        price: product.price,
        productName: product.name,
        productSku: product.sku
      })
    }
    
    setShowProductSearch(false)
    setSearchTerm('')
  }

  const calculateTotals = () => {
    const subtotal = watchedItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price)
    }, 0)
    
    const discountAmount = parseFloat(watchedDiscount) || 0
    const taxAmount = parseFloat(watchedTax) || 0
    const total = subtotal - discountAmount + taxAmount
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    }
  }

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals()

  const onSubmit = async (data) => {
    if (isViewing) return

    if (data.items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    setLoading(true)
    try {
      const saleData = {
        ...data,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }))
      }

      await salesAPI.create(saleData)
      toast.success('Sale created successfully')
      onSave()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create sale'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isViewing ? `Sale ${sale.saleNumber}` : 'New Sale'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isViewing 
                    ? `Created ${formatRelativeTime(sale.createdAt)} by ${sale.soldBy?.firstName} ${sale.soldBy?.lastName}`
                    : 'Create a new sales transaction'
                  }
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Information */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-md font-medium text-gray-900">Customer Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      {...register('customerName')}
                      type="text"
                      className="input"
                      placeholder="Enter customer name"
                      disabled={isViewing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      {...register('customerEmail', {
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input"
                      placeholder="customer@example.com"
                      disabled={isViewing}
                    />
                    {errors.customerEmail && (
                      <p className="mt-1 text-sm text-danger-600">{errors.customerEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      {...register('customerPhone')}
                      type="tel"
                      className="input"
                      placeholder="Phone number"
                      disabled={isViewing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      {...register('paymentMethod')}
                      className="input"
                      disabled={isViewing}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Payment">Mobile Payment</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-900">Items</h4>
                    {!isViewing && (
                      <button
                        type="button"
                        onClick={() => setShowProductSearch(true)}
                        className="btn btn-outline btn-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {field.productName || 'Unknown Product'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {field.productSku}
                          </p>
                        </div>
                        
                        <div className="w-20">
                          <input
                            {...register(`items.${index}.quantity`, {
                              required: 'Quantity is required',
                              min: { value: 1, message: 'Minimum quantity is 1' }
                            })}
                            type="number"
                            min="1"
                            className="input text-center"
                            disabled={isViewing}
                          />
                        </div>
                        
                        <div className="w-24">
                          <input
                            {...register(`items.${index}.price`, {
                              required: 'Price is required',
                              min: { value: 0.01, message: 'Price must be greater than 0' }
                            })}
                            type="number"
                            step="0.01"
                            className="input text-right"
                            disabled={isViewing}
                          />
                        </div>
                        
                        <div className="w-24 text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency((field.quantity || 0) * (field.price || 0))}
                          </p>
                        </div>
                        
                        {!isViewing && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1 text-gray-400 hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {fields.length === 0 && !isViewing && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No items added yet</p>
                      <button
                        type="button"
                        onClick={() => setShowProductSearch(true)}
                        className="btn btn-primary btn-sm mt-3"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Product
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="input"
                    placeholder="Additional notes..."
                    disabled={isViewing}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Order Summary</h4>
                
                <div className="card bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600">Discount:</label>
                        <div className="w-24">
                          <input
                            {...register('discount', {
                              min: { value: 0, message: 'Discount cannot be negative' }
                            })}
                            type="number"
                            step="0.01"
                            className="input text-right"
                            disabled={isViewing}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600">Tax:</label>
                        <div className="w-24">
                          <input
                            {...register('tax', {
                              min: { value: 0, message: 'Tax cannot be negative' }
                            })}
                            type="number"
                            step="0.01"
                            className="input text-right"
                            disabled={isViewing}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-primary-600">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isViewing && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`badge badge-${
                        sale.status === 'COMPLETED' ? 'success' :
                        sale.status === 'PENDING' ? 'warning' :
                        sale.status === 'CANCELLED' ? 'danger' : 'gray'
                      }`}>
                        {sale.status?.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(sale.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                {isViewing ? 'Close' : 'Cancel'}
              </button>
              {!isViewing && (
                <button
                  type="submit"
                  disabled={loading || fields.length === 0}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Sale...
                    </div>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Create Sale ({formatCurrency(total)})
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Product Search Modal */}
          {showProductSearch && (
            <div className="fixed inset-0 z-60 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowProductSearch(false)}></div>
                
                <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
                    <button
                      onClick={() => setShowProductSearch(false)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => handleProductSearch(e.target.value)}
                      className="input pl-10"
                      autoFocus
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sku} • Stock: {product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(product.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {products.length === 0 && searchTerm.length > 2 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No products found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
