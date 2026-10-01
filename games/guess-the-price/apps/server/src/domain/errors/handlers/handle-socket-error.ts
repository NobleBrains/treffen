import { Socket } from 'socket.io';
import { SocketError } from '../socket-error';
import { ExceptionOutgoingPayload } from '../../interfaces/mp-payloads.types';

export const handleSocketError = (error: unknown, socket: Socket) => {
	if (error instanceof SocketError) {
		socket.emit('exception', { msg: error.message, code: error.code } as ExceptionOutgoingPayload);
	} else {
		console.error(error);
		socket.emit('exception', { msg: 'Unknown server error', code: 500 } as ExceptionOutgoingPayload);
	}
};
