import { Request, Response } from 'express';
import { GuessService } from '../services/guess.service';
import { ControllerError } from '../../domain/errors/controller-error';

export class GuessController {
	public guessProductPrice = (req: Request, res: Response) => {
		const { productId, guessedPrice } = req.query;

		if (!productId || isNaN(Number(guessedPrice))) {
			res.status(400).json({ error: 'Please specify valid productId and guessedPrice in the query.' });
			return;
		}

		GuessService.guessProductPrice(productId.toString(), Number(guessedPrice))
			.then(r => res.json(r))
			.catch((error: ControllerError) => res.status(error.code).json({ error: error.message }));
	};
}
