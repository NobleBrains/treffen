import { PrismaClient } from '@prisma/client';
import { ControllerError } from '../../domain/errors/controller-error';
import { checkControllerError } from '../../domain/errors/handlers/handle-controller-error';

export class CategoryService {
	private prisma = new PrismaClient();

	public createNewCategory = async (name: string, id?: string) => {
		try {
			return await this.prisma.category.create({ data: { name, id } });
		} catch (error) {
			console.error(error);
			throw new ControllerError(`Could not create new category ${name}`, 500);
		}
	};

	public getCategories = async () => {
		try {
			const categories = await this.prisma.category.findMany();

			if (!categories) {
				throw new ControllerError('No categories in the system.', 404);
			}

			return categories;
		} catch (error) {
			checkControllerError(error as Error, 'An error occurred while trying to retrieve the categories.');
		}
	};
}
