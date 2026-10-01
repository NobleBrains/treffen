import { z } from 'zod';

export const requiresPlayerIdPayloadSchema = z.object({
	playerId: z.string({ message: 'playerId is required' }),
});

export const JoinSessionPayloadSchema = z.object({
	sessionId: z.string({ message: 'sessionId must be an uuid' }).optional(),
});

export const GuessPricePayloadSchema = z.object({
	playerId: z.string({ message: 'playerId is required' }),
	guessedPrice: z.number({ message: 'guessedPrice must be a number' }),
});

export const ReconnectPayloadSchema = z.object({
	playerId: z.string({ message: 'playerId is required' }),
	sessionId: z.string({ message: 'sessionId is required' }),
});
