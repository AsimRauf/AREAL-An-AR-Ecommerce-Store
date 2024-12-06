import mongoose from 'mongoose'
  const productSchema = new mongoose.Schema({
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    glbModel: { type: String },
    specifications: {
      dimensions: String,
      weight: String,
      material: String
    },
    inStock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    badges: [{
      type: String,
      enum: ['hot_selling', 'new_arrival', 'trending', 'best_seller', 'limited_edition']
    }],
}).set('toJSON', { virtuals: true })

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema)