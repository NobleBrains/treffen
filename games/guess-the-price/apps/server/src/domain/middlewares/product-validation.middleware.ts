import { NextFunction, Request, Response } from 'express';
import { productValidationSchema } from '../validation/product.schema';
import { z } from 'zod';

export const productBodyValidation = (req: Request, res: Response, next: NextFunction) => {
	const { product } = req.body;

	if (!product) {
		res.status(400).json({ error: 'Please include product information' });
		return;
	}

	try {
		productValidationSchema.parse(product);
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({ error });
		}
		return;
	}

	next();
};
