import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ControllerError } from '../../domain/errors/controller-error';

export class ProductsController {
	private productService = new ProductService();

	public addNewProduct = (req: Request, res: Response) => {
		const { product } = req.body;

		this.productService
			.createProduct(product)
			.then(product => res.status(201).json({ message: 'Product created', product }))
			.catch((error: ControllerError) => res.status(error.code).json({ error: error.message }));
	};
}
