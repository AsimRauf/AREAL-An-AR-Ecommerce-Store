import mongoose from 'mongoose'

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String, required: true },
  businessAddress: { type: String, required: true },
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
  storeDescription: String,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema)
