import { Schema } from 'zod';
import { SocketError } from '../errors/socket-error';

export const validateMpPayload = (payload: object, targetSchema: Schema) => {
	try {
		targetSchema.parse(payload);
	} catch {
		throw new SocketError(`Invalid payload, please include all the needed fields.`);
	}
};
