import { v4 as uuid } from 'uuid';
import { generateUsername } from 'unique-username-generator';
import { MPSessionDatasource } from '../../../domain/datasources/mp-session-datasource';
import { MpSession } from '../../../domain/multiplayer/mp-session';
import { Server } from 'socket.io';
import { SocketError } from '../../../domain/errors/socket-error';

export class MPSessionsService {
	private static sessionManager = new MPSessionDatasource();

	public static handlePlayerConnection(
		socketId: string,
		io: Server,
		sessionId?: string
	): { session: MpSession; player: { name: string; id: string } } {
		const player = this.createPlayer();

		if (this.sessionManager.isSocketOwnerOfSession(socketId)) {
			throw new SocketError('You are the host of a session.');
		}

		if (!sessionId) {
			const session = new MpSession({ ...player, isHost: true, socketId }, io);
			this.sessionManager.addSession(session);
			return { session, player };
		}

		const session = this.sessionManager.getSession(sessionId);
		if (!session) {
			throw new SocketError('The session does not exist', 404);
		}

		if (session.isSocketConnected(socketId)) {
			throw new SocketError('You are already connected to this session');
		}

		session.addPlayer({ ...player, isHost: false, socketId });
		return { session, player };
	}

	public static handlePlayerReconnection(sessionId: string, playerId: string, socketId: string) {
		const session = this.sessionManager.getSession(sessionId);
		if (!session) {
			throw new SocketError('This session does not exist', 404);
		}
		const player = session.reconnectPlayer(playerId, socketId);

		if (!player) {
			throw new SocketError('Cannot reconnect to session');
		}

		return {
			player,
			sessionDetails: {
				host: session.host.name,
				sessionId: session.id,
				currentlyPlaying: !!session.currentRound,
			},
			players: session.players.length,
		};
	}

	public static handlePlayerDisconnection(socketId: string, sessionId: string) {
		const playerSession = this.sessionManager.getSession(sessionId);
		playerSession?.playerDisconnected(socketId);
	}

	public static createPlayer() {
		const name = generateUsername('-');
		const id = uuid();

		return { name, id };
	}
}
