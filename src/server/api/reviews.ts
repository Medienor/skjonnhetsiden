import express from 'express';
import { z } from 'zod';
import { addReview, getReviewsByCompany } from '@/utils/reviewsData';

const router = express.Router();

// Simplified review validation schema
const reviewSchema = z.object({
  companyId: z.string().min(1),
  authorName: z.string().min(2).max(50),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500)
});

router.post('/reviews', async (req, res) => {
  try {
    // Validate request body
    const validatedData = reviewSchema.parse(req.body);

    // Add review
    const success = await addReview({
      companyId: validatedData.companyId,
      authorName: validatedData.authorName,
      rating: validatedData.rating,
      comment: validatedData.comment
    });

    if (success) {
      res.status(200).json({ message: 'Review added successfully' });
    } else {
      res.status(500).json({ error: 'Failed to add review' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid review data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Add GET endpoint for reviews
router.get('/reviews/:companyId', (req, res) => {
  try {
    const { companyId } = req.params;
    const reviews = getReviewsByCompany(companyId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

interface Review {
  id: string;
  companyId: string;
  authorName: string;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

export type { Review };

export default router;