import { Server, Socket } from 'socket.io';
import { MPSessionsService } from '../services/multiplayer/mp-sessions.service';
import { handleSocketError } from '../../domain/errors/handlers/handle-socket-error';
import { IncomingEvents, OutgoingEvents } from '../../domain/interfaces/mp-events.types';
import {
	JoinSessionPayload,
	PlayerDetailsOutgoingPayload,
	PlayerJoinsOutgoingPayload,
	PLayerReconnectsOutgoingPayload,
	ReconnectPayload,
	RequiredPlayerId,
	RoundStartsOutgoingPayload,
	SessionDetailsOutgoingPayload,
} from '../../domain/interfaces/mp-payloads.types';
import { validateMpPayload } from '../../domain/validation/validate-mp-payload';
import {
	JoinSessionPayloadSchema,
	ReconnectPayloadSchema,
	requiresPlayerIdPayloadSchema,
} from '../../domain/validation/mp-payloads-validation.schema';
import { MPGameService } from '../services/multiplayer/mp-game.service';

export const gameSessionSocketHandler = (io: Server, socket: Socket) => {
	let currentSessionID: string | null = null;

	const joinSession = (payload: JoinSessionPayload) => {
		try {
			validateMpPayload(payload, JoinSessionPayloadSchema);

			const { session, player } = MPSessionsService.handlePlayerConnection(socket.id, io, payload.sessionId);
			currentSessionID = session.id;
			socket.join(session.id);

			socket.emit(
				OutgoingEvents.SESSION_DETAILS,
				{
					sessionId: session.id,
					host: session.host.name,
					currentlyPlaying: !!session.currentRound,
					players: session.players.length,
				} as SessionDetailsOutgoingPayload,
				{ playerId: player.id, playerName: player.name } as PlayerDetailsOutgoingPayload
			);

			io.of('/mp-ws').to(session.id).emit(OutgoingEvents.PLAYER_JOINS_SESSION, { playerName: player.name, players: session.players.length } as PlayerJoinsOutgoingPayload);
		} catch (error) {
			handleSocketError(error, socket);
		}
	};

	const reconnect = (payload: ReconnectPayload) => {
		try {
			validateMpPayload(payload, ReconnectPayloadSchema);

			const { player, sessionDetails, players } = MPSessionsService.handlePlayerReconnection(
				payload.sessionId,
				payload.playerId,
				socket.id
			);

			socket.emit(OutgoingEvents.SESSION_DETAILS, {...sessionDetails, players} as SessionDetailsOutgoingPayload, { playerId: player.id, playerName: player.name, } as PlayerDetailsOutgoingPayload);
			socket.join(payload.sessionId);

			io.of('/mp-ws').to(payload.sessionId).emit(OutgoingEvents.PLAYER_RECONNECTS, { playerName: player.name, players } as PLayerReconnectsOutgoingPayload);
		} catch (error) {
			handleSocketError(error, socket);
		}
	};

	const disconnect = () => {
		if (!currentSessionID) return;
		MPSessionsService.handlePlayerDisconnection(socket.id, currentSessionID);
	};

	const endSession = (payload: RequiredPlayerId) => {
		try {
			validateMpPayload(payload, requiresPlayerIdPayloadSchema);

			const sessionId = [...socket.rooms][1];
			MPGameService.endSession(sessionId, payload.playerId);
		} catch (error) {
			handleSocketError(error, socket);
		}
	};

	const terminateSession = (payload: RequiredPlayerId) => {
		try {
			validateMpPayload(payload, requiresPlayerIdPayloadSchema);

			const sessionId = [...socket.rooms][1];
			MPGameService.terminateSession(sessionId, payload.playerId);

			io.of('/mp-ws').to(sessionId).emit(OutgoingEvents.SESSION_TERMINATE);
		} catch (error) {
			handleSocketError(error, socket);
		}
	};

	const restartSession = async (payload: RequiredPlayerId) => {
		try {
			validateMpPayload(payload, requiresPlayerIdPayloadSchema);

			const sessionId = [...socket.rooms][1];
			MPGameService.restartSession(sessionId, payload.playerId);
			const round = await MPGameService.startRound([...socket.rooms][1], payload.playerId);
			io.of('/mp-ws')
				.to([...socket.rooms][1])
				.emit(OutgoingEvents.ROUND_STARTS, round as RoundStartsOutgoingPayload);
		} catch (error) {
			handleSocketError(error, socket);
		}
	};

	socket.on(IncomingEvents.PLAYER_JOIN_SESSION, joinSession);
	socket.on(IncomingEvents.PLAYER_RECONNECT, reconnect);
	socket.on(IncomingEvents.HOST_END_SESSION, endSession);
	socket.on(IncomingEvents.HOST_RESTART_SESSION, restartSession);
	socket.on(IncomingEvents.HOST_TERMINATE_SESSION, terminateSession);
	socket.on('disconnect', disconnect);
};
