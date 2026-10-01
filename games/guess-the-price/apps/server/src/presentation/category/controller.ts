import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { ControllerError } from '../../domain/errors/controller-error';

export class CategoryController {
	private categoryService = new CategoryService();

	public createNewCategory = (req: Request, res: Response) => {
		const { id, name } = req.body;

		if (!name) {
			res.status(400).json({ error: 'Please specify the category name.' });
			return;
		}

		this.categoryService
			.createNewCategory(name, id)
			.then(category => res.status(201).json({ category }))
			.catch((error: ControllerError) => res.status(error.code).json({ error: error.message }));
	};

	public getCategories = (req: Request, res: Response) => {
		this.categoryService
			.getCategories()
			.then(categories => res.status(200).json(categories))
			.catch((error: ControllerError) => res.status(error.code).json({ error: error.message }));
	};
}
