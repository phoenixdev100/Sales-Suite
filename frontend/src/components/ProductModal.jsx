import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Upload, Package } from 'lucide-react'
import { productsAPI } from '../utils/api'
import { generateSKU } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ProductModal({ product, categories, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  
  const isEditing = !!product

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      price: '',
      cost: '',
      quantity: 0,
      minStock: 10,
      maxStock: 1000,
      categoryId: '',
      imageUrl: '',
      isActive: true
    }
  })

  const watchName = watch('name')
  const watchCategoryId = watch('categoryId')

  useEffect(() => {
    if (product) {
      // Populate form with existing product data
      Object.keys(product).forEach(key => {
        if (key !== 'category') {
          setValue(key, product[key])
        }
      })
      setValue('categoryId', product.category?.id || '')
      setImagePreview(product.imageUrl)
    }
  }, [product, setValue])

  // Auto-generate SKU for new products
  useEffect(() => {
    if (!isEditing && watchName && watchCategoryId) {
      const category = categories.find(c => c.id === watchCategoryId)
      if (category) {
        const generatedSKU = generateSKU(watchName, category.name)
        setValue('sku', generatedSKU)
      }
    }
  }, [watchName, watchCategoryId, categories, isEditing, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Convert string numbers to actual numbers
      const formattedData = {
        ...data,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        quantity: parseInt(data.quantity),
        minStock: parseInt(data.minStock),
        maxStock: parseInt(data.maxStock)
      }

      if (isEditing) {
        await productsAPI.update(product.id, formattedData)
        toast.success('Product updated successfully')
      } else {
        await productsAPI.create(formattedData)
        toast.success('Product created successfully')
      }
      
      onSave()
    } catch (error) {
      const message = error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} product`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, you would upload this to a file storage service
      // For now, we'll just show a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setValue('imageUrl', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditing ? 'Update product information' : 'Fill in the details to add a new product'}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  {...register('name', { 
                    required: 'Product name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  type="text"
                  className="input"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input"
                  placeholder="Enter product description"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  {...register('sku', { 
                    required: 'SKU is required',
                    minLength: { value: 2, message: 'SKU must be at least 2 characters' }
                  })}
                  type="text"
                  className="input"
                  placeholder="Product SKU"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-danger-600">{errors.sku.message}</p>
                )}
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  {...register('barcode')}
                  type="text"
                  className="input"
                  placeholder="Product barcode"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('categoryId', { required: 'Category is required' })}
                  className="input"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-danger-600">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price *
                </label>
                <input
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-danger-600">{errors.price.message}</p>
                )}
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price *
                </label>
                <input
                  {...register('cost', { 
                    required: 'Cost is required',
                    min: { value: 0.01, message: 'Cost must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-danger-600">{errors.cost.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <input
                  {...register('quantity', { 
                    min: { value: 0, message: 'Quantity cannot be negative' }
                  })}
                  type="number"
                  className="input"
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-danger-600">{errors.quantity.message}</p>
                )}
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Level
                </label>
                <input
                  {...register('minStock', { 
                    min: { value: 0, message: 'Min stock cannot be negative' }
                  })}
                  type="number"
                  className="input"
                  placeholder="10"
                />
                {errors.minStock && (
                  <p className="mt-1 text-sm text-danger-600">{errors.minStock.message}</p>
                )}
              </div>

              {/* Max Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock Level
                </label>
                <input
                  {...register('maxStock', { 
                    min: { value: 1, message: 'Max stock must be at least 1' }
                  })}
                  type="number"
                  className="input"
                  placeholder="1000"
                />
                {errors.maxStock && (
                  <p className="mt-1 text-sm text-danger-600">{errors.maxStock.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setValue('imageUrl', '')
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-danger-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-danger-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="btn btn-outline cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    {...register('isActive')}
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Product is active and available for sale
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
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
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditing ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
