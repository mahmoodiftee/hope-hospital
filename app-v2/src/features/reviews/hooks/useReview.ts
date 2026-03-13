import { useState } from 'react';

export interface ReviewState {
    rating: number;
    comment: string;
}

export default function useReview(initialRating: number = 0) {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitReview = async (doctorId: string) => {
        if (rating === 0) {
            setError('Please provide a rating');
            return false;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Simulate API call for submitting review
            await new Promise(resolve => setTimeout(resolve, 800));
            // Review mock implementation
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit review');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetReview = () => {
        setRating(initialRating);
        setComment('');
        setError(null);
    };

    return {
        rating,
        setRating,
        comment,
        setComment,
        isSubmitting,
        error,
        submitReview,
        resetReview
    };
}
