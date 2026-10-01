import { SocketError } from '../../../domain/errors/socket-error';
import { MPSessionDatasource } from '../../../domain/datasources/mp-session-datasource';
import { GuessService } from '../guess.service';
import { RandomService } from '../random.service';

export class MPGameService {
	private static mpSessionDatasource = new MPSessionDatasource();

	public static startRound = async (sessionId: string, playerId: string) => {
		const session = this.mpSessionDatasource.getSession(sessionId);

		if (!session) {
			throw new SocketError('You must be in a game session to start rounds.');
		}

		if (session.host.id !== playerId) {
			throw new SocketError('Only the host can start a new round.');
		}

		try {
			const product = await RandomService.getRandomProduct(session.seenProducts);
			if (!product) {
				throw new Error('Cannot get random product (MPGameService)');
			}
			const { guesses, ...rest } = session.startRound(product);
			return rest;
		} catch (error) {
			console.error(error);
			throw new SocketError('Cannot start the round, an error occurred while getting the product.');
		}
	};

	public static makeGuess = async (sessionId: string, playerId: string, guessedPrice: number) => {
		const session = this.mpSessionDatasource.getSession(sessionId);

		if (!session) {
			throw new SocketError('You must be in a game session to guess the price of a product.');
		}

		try {
			const results = await GuessService.guessProductPrice(session.currentRound?.product.id || '', guessedPrice);
			session.guessPrice(playerId, results?.points ?? 0, guessedPrice ?? 0);
			return session.getGuessesLeft();
		} catch (error) {
			console.error(error);
			throw new SocketError('An error occurred while guessing the price for this product.');
		}
	};

	public static endSession = (sessionId: string, playerId: string) => {
		const session = this.mpSessionDatasource.getSession(sessionId);

		if (!session) {
			throw new SocketError('You must be in a game session.');
		}

		if (session.host.id !== playerId) {
			throw new SocketError('Only the host can terminate the session.');
		}

		session.endSession();
	};

	public static terminateSession = (sessionId: string, playerId: string) => {
		const session = this.mpSessionDatasource.getSession(sessionId);

		if (!session) {
			throw new SocketError('You must be in a game session.');
		}

		if (session.host.id !== playerId) {
			throw new SocketError('Only the host can terminate the session.');
		}
	};

	public static restartSession = async (sessionId: string, playerId: string) => {
		const session = this.mpSessionDatasource.getSession(sessionId);

		if (!session) {
			throw new SocketError('You must be in a game session.');
		}

		if (session.host.id !== playerId) {
			throw new SocketError('Only the host can restart the session.');
		}

		session.restartSession();
	};
}
