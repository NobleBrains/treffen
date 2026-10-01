import { RandomProduct } from './product.interface';

export interface Player {
	name: string;
	id: string;
	isHost: boolean;
	socketId: string;
	disconnectedAt?: Date;
	metrics?: {
		points: number;
		guesses: number;
		bestGuess: number;
	};
}

export interface PlayerGuess {
	guessedPrice: number;
	points: number;
	playerId: string;
	playerName: string;
}

export interface Round {
	product: RandomProduct;
	startTime: Date;
	seconds: number;
	guesses: PlayerGuess[];
}

export interface PlayerSessionResultsRecord {
	playerName: string;
	points: number;
	guesses: number;
	bestGuess: number;
}

export interface PlayerRoundResultsRecord {
	playerName: string;
	guessedPrice: number;
	points: number;
}
