import { NextFunction, Request, Response } from 'express';

export const apiKeyValidation = (req: Request, res: Response, next: NextFunction) => {
	const { apiKey } = req.query;

	if (!apiKey) {
		res.status(401).json({ error: 'Unauthenticated' });
		return;
	}

	if (apiKey.toString() !== process.env.API_KEY) {
		res.status(403).json({ error: 'Unauthorized' });
		return;
	}

	next();
};
