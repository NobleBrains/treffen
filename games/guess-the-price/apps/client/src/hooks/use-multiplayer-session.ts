import { IncomingEvents, OutgoingEvents } from '@/interfaces/mp-events.types';
import {
	EndSessionPayload,
	PlayerGuessOutgoingPayload,
	RoundResultsOutgoingPayload,
	SessionResultsOutgoingPayload,
	StartRoundPayload,
} from '@/interfaces/mp-payloads.types';
import { socket } from '@/socket';
import { useMpStore } from '@/stores/mp-store';
import { useVolatileMpStore } from '@/stores/mp-volatile-store';
import { useEffect } from 'react';
import { RoundStartsOutgoingPayload, GuessPricePayload } from '../interfaces/mp-payloads.types';

export const useMultiplayerSession = () => {
	const mpStore = useMpStore();
	const mpVolatileStore = useVolatileMpStore();

	const hostStartRound = () => {
		if (mpStore.isHost) {
			socket.emit(IncomingEvents.HOST_STARTS_ROUND, { playerId: mpStore.playerId } as StartRoundPayload);
		}
	};

	const guessPrice = (guessedPrice: number) => {
		if (mpVolatileStore.currentlyPlaying && mpVolatileStore.roundData.product) {
			socket.emit(IncomingEvents.PLAYER_GUESS_PRICE, { guessedPrice, playerId: mpStore.playerId } as GuessPricePayload);
			mpVolatileStore.guessPrice(guessedPrice);
		}
	};

	const hostEndSession = () => {
		if (!mpVolatileStore.currentlyPlaying) {
			socket.emit(IncomingEvents.HOST_END_SESSION, { playerId: mpStore.playerId } as EndSessionPayload);
		}
	};

	const hostTerminateSession = () => {
		socket.emit(IncomingEvents.HOST_TERMINATE_SESSION, { playerId: mpStore.playerId } as EndSessionPayload);
	};

	const hostRestartSession = () => {
		socket.emit(IncomingEvents.HOST_RESTART_SESSION, { playerId: mpStore.playerId } as EndSessionPayload);
	};

	useEffect(() => {
		const onRoundStart = (payload: RoundStartsOutgoingPayload) => {
			mpVolatileStore.startRound(payload.product, payload.endTime);
		};

		const onRoundEnd = (payload: RoundResultsOutgoingPayload) => {
			mpVolatileStore.endRound(payload.playerResults);
		};

		const onPlayerGuess = (payload: PlayerGuessOutgoingPayload) => {
			mpVolatileStore.updatePlayersLeft(payload.players - (payload.currentGuesses ?? payload.players));
		};

		const onSessionEnd = (payload: SessionResultsOutgoingPayload) => {
			mpVolatileStore.endSession(payload.playerResults, payload.roundsPlayed);
		};

		const onSessionRestart = () => {
			mpVolatileStore.reset();
		};

		socket.on(OutgoingEvents.ROUND_STARTS, onRoundStart);
		socket.on(OutgoingEvents.ROUND_ENDS, onRoundEnd);
		socket.on(OutgoingEvents.PLAYER_GUESS, onPlayerGuess);
		socket.on(OutgoingEvents.SESSION_ENDS, onSessionEnd);
		socket.on(OutgoingEvents.SESSION_RESTARTS, onSessionRestart);

		return () => {
			socket.off(OutgoingEvents.ROUND_STARTS, onRoundStart);
			socket.off(OutgoingEvents.ROUND_ENDS, onRoundEnd);
			socket.off(OutgoingEvents.PLAYER_GUESS, onPlayerGuess);
			socket.off(OutgoingEvents.SESSION_ENDS, onSessionEnd);
			socket.off(OutgoingEvents.SESSION_RESTARTS, onSessionRestart);
		};
	}, []);

	return {
		hostStartRound,
		hostEndSession,
		hostTerminateSession,
		hostRestartSession,
		guessPrice,
	};
};
