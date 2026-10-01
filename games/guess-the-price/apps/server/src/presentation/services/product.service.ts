import { PrismaClient } from '@prisma/client';
import { Product } from '../../domain/interfaces/product.interface';
import { ControllerError } from '../../domain/errors/controller-error';

export class ProductService {
	private prismaClient = new PrismaClient();

	public createProduct = async (product: Product) => {
		try {
			return await this.prismaClient.product.create({ data: product });
		} catch (error) {
			console.log(error);
			throw new ControllerError("Error creating new product", 500)
		}
	};
}
