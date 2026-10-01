import 'dotenv/config';
import { v4 as uuid } from 'uuid';
import { Server } from 'socket.io';

import { SocketError } from '../errors/socket-error';
import { compareDates } from '../../utils/compare-dates';

import { OutgoingEvents } from '../interfaces/mp-events.types';
import { Player, Round, PlayerSessionResultsRecord } from '../interfaces/mp.interfaces';
import { RandomProduct } from '../interfaces/product.interface';
import {
	PlayerLeavesOutgoingPayload,
	RoundResultsOutgoingPayload,
	SessionResultsOutgoingPayload,
} from '../interfaces/mp-payloads.types';

export class MpSession {
	public readonly host: Player;
	public readonly id: string;
	public players: Player[] = [];
	public lastActive: Date;

	public currentRound: Round | null;
	public pastRounds: Round[];
	public seenProducts: string[];

	private readonly io: Server;

	constructor(host: Player, io: Server) {
		this.host = host;
		this.addPlayer(host);
		this.id = uuid();
		this.currentRound = null;
		this.pastRounds = [];
		this.seenProducts = [];
		this.io = io;
		this.lastActive = new Date();
	}

	//Session management
	public endSession() {
		this.io
			.of('/mp-ws')
			.to(this.id)
			.emit(OutgoingEvents.SESSION_ENDS, this.getSessionResults() as SessionResultsOutgoingPayload);
	}

	public restartSession() {
		this.currentRound = null;
		this.pastRounds = [];
		this.seenProducts = [];
		this.lastActive = new Date();

		this.io.of('/mp-ws').to(this.id).emit(OutgoingEvents.SESSION_RESTARTS);
	}

	public getSessionResults() {
		const sessionResults: { roundsPlayed: number; playerResults: PlayerSessionResultsRecord[] } = {
			roundsPlayed: 0,
			playerResults: [],
		};

		if (!this.pastRounds.length) {
			return sessionResults;
		}

		sessionResults.roundsPlayed = this.pastRounds.length;
		sessionResults.playerResults = this.players.map(player => ({
			playerName: player.name,
			guesses: player.metrics?.guesses ?? 0,
			points: player.metrics?.points ?? 0,
			bestGuess: player.metrics?.bestGuess ?? 0,
		}));

		sessionResults.playerResults = sessionResults.playerResults.sort((a, b) => b.points - a.points);

		return sessionResults;
	}

	//Player management
	public addPlayer(player: Player) {
		if (!player) {
			throw new SocketError('Cannot add player with empty id or name.');
		}

		if (this.players.length >= (Number(process.env.MAX_PLAYERS_SESSION) || 10)) {
			throw new SocketError('The session is full.');
		}

		this.players.push({ ...player, metrics: { points: 0, guesses: 0, bestGuess: 0 } });
		this.refreshActivity();
		return player;
	}

	public reconnectPlayer(playerId: string, socketId: string) {
		const existingPlayer = this.players.find(p => p.id === playerId);

		if (existingPlayer) {
			existingPlayer.socketId = socketId;
			existingPlayer.disconnectedAt = undefined;
			return existingPlayer;
		}
	}

	public playerDisconnected(socketId: string) {
		const disconnectedPlayer = this.players.find(player => player.socketId == socketId);
		if (!disconnectedPlayer) return;

		disconnectedPlayer.disconnectedAt = new Date();
		this.io
			.of('/mp-ws')
			.to(this.id)
			.emit(OutgoingEvents.PLAYER_LEAVES, {
				playerName: disconnectedPlayer.name,
				players: this.players.length,
			} as PlayerLeavesOutgoingPayload);
	}

	public isSocketConnected(socketId: string) {
		const player = this.players.find(player => player.socketId == socketId);
		return !!player;
	}

	//Rounds & game
	public startRound(product: RandomProduct) {
		this.seenProducts.push(product!.id);
		this.currentRound = {
			product: product!,
			startTime: new Date(),
			seconds: Number(process.env.MP_SESSION_ROUND_DURATION_SECONDS ?? 30),
			guesses: [],
		};
		this.refreshActivity();
		return {
			...this.currentRound,
			endTime: new Date().setSeconds(
				this.currentRound.startTime.getSeconds() + Number(process.env.MP_SESSION_ROUND_DURATION_SECONDS ?? 30)
			),
		};
	}

	public async guessPrice(playerId: string, points: number, guessedPrice: number) {
		if (!this.currentRound) {
			throw new SocketError('The round has finished');
		}
		if (this.currentRound.guesses.find(guess => guess.playerId == playerId)) {
			throw new SocketError('Player has already guessed the price');
		}
		const player = this.players.find(player => player.id == playerId);
		if (!player) {
			throw new SocketError('Player is not in the session');
		}

		this.currentRound.guesses.push({
			playerId,
			guessedPrice,
			points: points,
			playerName: player.name,
		});

		if (player.metrics!.bestGuess < points) {
			player.metrics!.bestGuess = points;
		}

		player.metrics!.points += points;
		player.metrics!.guesses++;

		if (this.currentRound.guesses.length === this.players.length) {
			this.endRound();
		}

		this.refreshActivity();
	}

	private endRound() {
		if (!this.currentRound) return;

		this.pastRounds.push({ ...this.currentRound });
		this.io
			.of('/mp-ws')
			.to(this.id)
			.emit(OutgoingEvents.ROUND_ENDS, this.getRoundResults() as RoundResultsOutgoingPayload);
		this.currentRound = null;
		this.refreshActivity();
	}

	public getGuessesLeft() {
		return {
			currentGuesses: this.currentRound?.guesses.length,
			players: this.players.length,
		};
	}

	public getRoundResults() {
		if (!this.currentRound) return null;
		const results = this.currentRound.guesses.map(g => {
			return {
				guessedPrice: g.guessedPrice,
				points: g.points,
				playerName: g.playerName,
			};
		});

		return {
			product: this.currentRound.product,
			playerResults: results.sort((a, b) => b.points - a.points),
		};
	}

	//Housekeeping
	public roundTick() {
		if (!this.currentRound) return;

		if (
			compareDates(this.currentRound.startTime, new Date()) >=
			Number(process.env.MP_SESSION_ROUND_DURATION_SECONDS ?? 30)
		) {
			this.endRound();
		}
	}

	public refreshActivity() {
		this.lastActive = new Date();
	}

	public checkSessionActive() {
		if (compareDates(this.lastActive, new Date()) >= Number(process.env.MP_SESSION_INACTIVE_SECONDS ?? 180)) {
			this.io.of('/mp-ws').to(this.id).emit(OutgoingEvents.SESSION_TERMINATE);
			return false;
		}
		return true;
	}
}
