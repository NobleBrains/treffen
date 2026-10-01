import { useEffect } from 'react';
import { socket } from '@/socket';
import { OutgoingEvents } from '@/interfaces/mp-events.types';
import {
	ExceptionOutgoingPayload,
	PlayerJoinsOutgoingPayload,
	PlayerLeavesOutgoingPayload,
	PLayerReconnectsOutgoingPayload,
} from '@/interfaces/mp-payloads.types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useMpStore } from '@/stores/mp-store';
import { useVolatileMpStore } from '@/stores/mp-volatile-store';

export const useMpNotifications = () => {
	const navigate = useNavigate();
	const mpStore = useMpStore();
	const volatileMpStore = useVolatileMpStore();

	useEffect(() => {
		const onPlayerJoin = (payload: PlayerJoinsOutgoingPayload) => {
			toast.success('Player joins', { description: payload.playerName });
		};

		const onPlayerLeave = (payload: PlayerLeavesOutgoingPayload) => {
			toast.warning('Player leaves', { description: payload.playerName });
		};

		const onPlayerReconnect = (payload: PLayerReconnectsOutgoingPayload) => {
			toast.info('Player reconnects', { description: payload.playerName });
		};

		const onError = (payload: ExceptionOutgoingPayload) => {
			toast.error('Error', { description: payload.msg });

			if (payload.code === 404) {
				mpStore.clear();
				volatileMpStore.reset();
				navigate('/multiplayer');
			}
		};

		socket.on(OutgoingEvents.PLAYER_JOINS_SESSION, onPlayerJoin);
		socket.on(OutgoingEvents.PLAYER_LEAVES, onPlayerLeave);
		socket.on(OutgoingEvents.PLAYER_RECONNECTS, onPlayerReconnect);
		socket.on(OutgoingEvents.EXCEPTION, onError);

		return () => {
			socket.off(OutgoingEvents.PLAYER_JOINS_SESSION, onPlayerJoin);
			socket.off(OutgoingEvents.PLAYER_LEAVES, onPlayerLeave);
			socket.off(OutgoingEvents.PLAYER_RECONNECTS, onPlayerReconnect);
			socket.off(OutgoingEvents.EXCEPTION, onError);
		};
	}, [toast]);
};
