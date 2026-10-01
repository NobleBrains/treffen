import { Router } from 'express';
import { GuessController } from './controller';

export class GuessRoutes {
	public get routes() {
		const guessController = new GuessController();
		const router = Router();

		router.post('/product', guessController.guessProductPrice);

		return router;
	}
}
