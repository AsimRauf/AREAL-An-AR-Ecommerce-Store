const MONGODB_URI = `mongodb+srv://asimraufbuzz:${process.env.MONGODB_PASSWORD}@cluster0.u7sas.mongodb.net/CommerceDB?retryWrites=true&w=majority&appName=Cluster0`;

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
