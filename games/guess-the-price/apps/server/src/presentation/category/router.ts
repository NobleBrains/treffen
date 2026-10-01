import { Router } from 'express';
import { CategoryController } from './controller';
import { apiKeyValidation } from '../../domain/middlewares/api-key-validation.middleware';

export class CategoryRouter {
	public get routes() {
		const router = Router();
		const categoryController = new CategoryController();

		router.post('/new', apiKeyValidation, categoryController.createNewCategory);
		router.get('/', categoryController.getCategories);

		return router;
	}
}
