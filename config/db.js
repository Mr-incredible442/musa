import mongoose from 'mongoose';

const isProduction = process.env.NODE_ENV === 'production';

export default function connectDB() {
  mongoose.set('strictQuery', true);
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...(isProduction && { ssl: true }),
    })
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
}
