import { Router } from 'express';
import { RandomRoutes } from './random/routes';
import { ProductRoutes } from './product/routes';
import { productBodyValidation } from '../domain/middlewares/product-validation.middleware';
import { GuessRoutes } from './guess/routes';
import { CategoryRouter } from './category/router';

export class AppRoutes {
	private randomRoutes = new RandomRoutes();
	private productRoutes = new ProductRoutes();
	private guessRoutes = new GuessRoutes();
	private categoryRoutes = new CategoryRouter();

	public get routes() {
		const router = Router();

		router.use('/product', productBodyValidation, this.productRoutes.routes);
		router.use('/category', this.categoryRoutes.routes);

		router.use('/guess', this.guessRoutes.routes);
		router.use('/random', this.randomRoutes.routes);

		return router;
	}
}
