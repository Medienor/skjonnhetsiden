import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define types
interface Review {
  id: number;
  companyId: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsData {
  reviews: Review[];
}

const app = express();
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the reviews file path explicitly
const REVIEWS_FILE = path.join(__dirname, '../../data/reviews.json');

// Initialize reviews file if it doesn't exist
if (!fs.existsSync(REVIEWS_FILE)) {
  // Ensure the directory exists
  const dir = path.dirname(REVIEWS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // Initialize with empty reviews array
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify({ reviews: [] }, null, 2));
  console.log('📁 Created new reviews file at:', REVIEWS_FILE);
}

// Add function to calculate average rating
const calculateAverageRating = (reviews: Review[]): number => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1)) || 0; // Fallback to 0 if NaN
};

// Helper function to read reviews
const getReviews = () => {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const fileContent = fs.readFileSync(REVIEWS_FILE, 'utf8');
      return JSON.parse(fileContent);
    }
    return { reviews: [] };
  } catch (error) {
    console.error('Error reading reviews:', error);
    return { reviews: [] };
  }
};

// GET endpoint
app.get('/api/reviews/:companyId', (req, res) => {
  try {
    const { companyId } = req.params;
    const data = getReviews();
    
    const companyReviews = data.reviews.filter((r: Review) => r.companyId === companyId);
    const totalReviews = companyReviews.length;
    const averageRating = totalReviews > 0 
      ? companyReviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / totalReviews 
      : 0;

    res.json({
      reviews: companyReviews,
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST endpoint
app.post('/api/reviews', (req, res) => {
  try {
    const { companyId, authorName, rating, comment } = req.body;
    
    // Read current reviews (fresh data)
    const data = getReviews();
    
    const newReview = {
      id: Date.now(),
      companyId,
      authorName,
      rating: Number(rating),
      comment,
      date: new Date().toISOString()
    };

    // Add new review
    data.reviews.push(newReview);
    
    // Save to file
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2));
    
    // Get updated stats
    const companyReviews = data.reviews.filter((r: Review) => r.companyId === companyId);
    const totalReviews = companyReviews.length;
    const averageRating = totalReviews > 0 
      ? companyReviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / totalReviews 
      : 0;

    res.status(201).json({
      review: newReview,
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 