import mongoose from "mongoose";


let isConnected = false;

export const connectTodb = async () => {
  mongoose.set('strictQuery', true);
  // Vérifie si MONGODB_URI est défini
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    return;
  }

  if(isConnected) return console.log('=> using existing database connection');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MONGODB Connected');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};
