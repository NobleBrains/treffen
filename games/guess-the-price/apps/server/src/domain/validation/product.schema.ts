import { z } from 'zod';

export const productValidationSchema = z.object({
	name: z.string().min(5).max(255),
	image: z.string().url(),
	price: z.number(),
	priceMessage: z.string().optional(),
	description: z.string().min(10).max(500).optional(),
	source: z.string().optional(),
	categoryId: z.string().optional(),
});
