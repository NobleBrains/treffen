import { Router } from 'express';
import { RandomController } from './controller';

export class RandomRoutes {
	private randomController = new RandomController();

	public get routes() {
		const router = Router();

		router.post('/product', this.randomController.getRandomProduct);
		router.post('/product/highLow', this.randomController.getRandomProductHighLow);

		return router;
	}
}
