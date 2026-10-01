import { Router } from 'express';
import { ProductsController } from './controller';
import { apiKeyValidation } from '../../domain/middlewares/api-key-validation.middleware';

export class ProductRoutes {
	public get routes() {
		const productsController = new ProductsController();
		const router = Router();

		router.use(apiKeyValidation);
		router.post('/new', productsController.addNewProduct);

		return router;
	}
}
