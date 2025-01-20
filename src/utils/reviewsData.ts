import fs from 'fs';
import path from 'path';
import type { Review } from '@/server/api/reviews';

// Add interface for stored review format
interface StoredReview extends Omit<Review, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
}

interface ReviewsData {
  reviews: StoredReview[];
}

const REVIEWS_FILE = path.join(process.cwd(), 'src/data/reviews.json');

export const getReviewsByCompany = (orgNumber: string): Review[] => {
  try {
    const data = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8')) as ReviewsData;
    return data.reviews
      .filter(review => review.companyId === orgNumber)
      .map(review => ({
        ...review,
        created_at: new Date(review.created_at),
        updated_at: new Date(review.updated_at),
      }));
  } catch (error) {
    console.error('Error reading reviews:', error);
    return [];
  }
};

export const addReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    const data = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8')) as ReviewsData;
    
    const now = new Date();
    const newReview: Review = {
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      ...review
    };

    // Convert dates to ISO strings for JSON storage
    const reviewForStorage: StoredReview = {
      ...newReview,
      created_at: newReview.created_at.toISOString(),
      updated_at: newReview.updated_at.toISOString(),
    };

    data.reviews.push(reviewForStorage);
    
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    return false;
  }
};

export const getAverageRating = (orgNumber: string): number => {
  const reviews = getReviewsByCompany(orgNumber);
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
}; 