import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';

export interface PlayerDetails {
	playerId: string;
	playerName: string;
	isHost: boolean;
}

export interface SessionDetails {
	sessionId: string;
	players: number;
}

interface MpState extends PlayerDetails, SessionDetails {
	setSession: (details: SessionDetails) => void;
	setPlayer: (details: PlayerDetails) => void;
	setPlayers: (players: number) => void;
	clear: () => void;
}

export const useMpStore = create<MpState>()(
	persist(
		set => ({
			sessionId: '',
			playerId: '',
			playerName: '',
			isHost: false,
			players: 0,
			sessionStatus: {
				sessionStarted: false,
			},

			setSession: (details: SessionDetails) => set(() => ({ ...details })),
			setPlayer: (details: PlayerDetails) => set(() => ({ ...details })),
			setPlayers: (players: number) => set(() => ({ players })),
			clear: () =>
				set(() => ({
					sessionId: '',
					playerId: '',
					playerName: '',
					isHost: false,
					players: 0,
					sessionStatus: {
						sessionStarted: false,
					},
				})),
		}),
		{
			name: 'multiplayer',
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);
