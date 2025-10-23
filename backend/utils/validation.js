const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Auth validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'SALESPERSON').default('SALESPERSON')
});

// Product validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow(''),
  sku: Joi.string().min(2).max(50).required(),
  barcode: Joi.string().max(50).allow(''),
  price: Joi.number().positive().precision(2).required(),
  cost: Joi.number().positive().precision(2).required(),
  quantity: Joi.number().integer().min(0).default(0),
  minStock: Joi.number().integer().min(0).default(10),
  maxStock: Joi.number().integer().min(1).default(1000),
  categoryId: Joi.string().required(),
  imageUrl: Joi.string().uri().allow('')
});

const updateProductSchema = productSchema.fork(['sku'], (schema) => schema.optional());

// Category validation schemas
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).allow('')
});

// Sale validation schemas
const saleSchema = Joi.object({
  customerName: Joi.string().max(100).allow(''),
  customerEmail: Joi.string().email().allow(''),
  customerPhone: Joi.string().max(20).allow(''),
  paymentMethod: Joi.string().max(50).allow(''),
  discount: Joi.number().min(0).precision(2).default(0),
  tax: Joi.number().min(0).precision(2).default(0),
  notes: Joi.string().max(500).allow(''),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().positive().required(),
      price: Joi.number().positive().precision(2).required()
    })
  ).min(1).required()
});

// User validation schemas
const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'SALESPERSON'),
  isActive: Joi.boolean()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

module.exports = {
  validateRequest,
  loginSchema,
  registerSchema,
  productSchema,
  updateProductSchema,
  categorySchema,
  saleSchema,
  updateUserSchema,
  changePasswordSchema
};
