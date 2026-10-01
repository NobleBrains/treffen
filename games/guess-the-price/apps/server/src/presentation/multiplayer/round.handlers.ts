import { Server, Socket } from 'socket.io';
import { handleSocketError } from '../../domain/errors/handlers/handle-socket-error';
import { MPGameService } from '../services/multiplayer/mp-game.service';
import { IncomingEvents, OutgoingEvents } from '../../domain/interfaces/mp-events.types';
import { GuessPricePayload, PlayerGuessOutgoingPayload, RoundStartsOutgoingPayload, StartRoundPayload } from '../../domain/interfaces/mp-payloads.types';
import { validateMpPayload } from '../../domain/validation/validate-mp-payload';
import {
	GuessPricePayloadSchema,
	requiresPlayerIdPayloadSchema,
} from '../../domain/validation/mp-payloads-validation.schema';

export const sessionRoundsSocketHandlers = (io: Server, socket: Socket) => {
	const startRound = async (payload: StartRoundPayload) => {
		try {
			validateMpPayload(payload, requiresPlayerIdPayloadSchema);

			const round = await MPGameService.startRound([...socket.rooms][1], payload.playerId);
			io.of('/mp-ws').to([...socket.rooms][1]).emit(OutgoingEvents.ROUND_STARTS, round  as RoundStartsOutgoingPayload);
		} catch (error) {
			handleSocketError(error, socket);
		}
	};

	const guessPrice = async (payload: GuessPricePayload) => {
		try {
			validateMpPayload(payload, GuessPricePayloadSchema);

			const guessesLeft = await MPGameService.makeGuess([...socket.rooms][1], payload.playerId, payload.guessedPrice);

			if (guessesLeft.currentGuesses !== guessesLeft.players) {
				io.of('/mp-ws').to([...socket.rooms][1]).emit(OutgoingEvents.PLAYER_GUESS, guessesLeft as PlayerGuessOutgoingPayload);
			}
		} catch (error) {
			handleSocketError(error, socket);
		}
	};

	socket.on(IncomingEvents.HOST_STARTS_ROUND, startRound);
	socket.on(IncomingEvents.PLAYER_GUESS_PRICE, guessPrice);
};
