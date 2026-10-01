import { PlayerRoundResultsRecord, PlayerSessionResultsRecord } from '@/interfaces/mp.interfaces';
import { RandomProduct } from '@/interfaces/product.interface';
import { create } from 'zustand';

interface VolatileMpStore {
	sessionStarted: boolean;
	currentlyPlaying: boolean;
	connectedToSession: boolean;
	showingRoundResults: boolean;
	showingSessionResults: boolean;
	waitingForRoundEnd: boolean;
	waitingForResults: boolean;
	guessedPrice: number;
	playersLeft: number;
	roundData: {
		product: RandomProduct | null;
		endTime: number;
		results: PlayerRoundResultsRecord[] | null;
	};
	sessionData: {
		sessionResults: null | PlayerSessionResultsRecord[];
		roundsPlayed: number;
	};

	startRound: (randomProduct: RandomProduct, endTime: number) => void;
	endRound: (playerResults: PlayerRoundResultsRecord[]) => void;
	reset: () => void;
	loadSession: (sessionStarted: boolean, currentlyPlaying: boolean) => void;
	setConnected: (connected: boolean) => void;
	guessPrice: (price: number) => void;
	updatePlayersLeft: (left: number) => void;
	endSession: (results: PlayerSessionResultsRecord[], roundsPlayed: number) => void;
}

const initialState = {
	sessionStarted: false,
	currentlyPlaying: false,
	connectedToSession: false,
	showingRoundResults: false,
	waitingForRoundEnd: false,
	showingSessionResults: false,
	waitingForResults: false,
	guessedPrice: 0,
	playersLeft: 0,
	roundData: {
		product: null,
		endTime: 0,
		results: null,
	},
	sessionData: {
		sessionResults: null,
		roundsPlayed: 0,
	},
};

export const useVolatileMpStore = create<VolatileMpStore>()(set => ({
	...initialState,

	startRound: (randomProduct: RandomProduct, endTime: number) =>
		set(() => ({
			sessionStarted: true,
			currentlyPlaying: true,
			showingRoundResults: false,
			showingSessionResults: false,
			waitingForRoundEnd: false,
			roundData: {
				product: randomProduct,
				endTime,
				results: null,
			},
		})),
	endRound: (results: PlayerRoundResultsRecord[]) =>
		set(state => ({
			currentlyPlaying: false,
			showingRoundResults: true,
			waitingForResults: false,
			roundData: { ...state.roundData, results },
		})),
	endSession: (results, roundsPlayed) =>
		set(() => ({
			sessionData: { roundsPlayed, sessionResults: results },
			showingSessionResults: true,
			showingRoundResults: false,
		})),
	loadSession: (sessionStarted, currentlyPlaying) => set(() => ({ sessionStarted, currentlyPlaying })),
	setConnected: connected => set((state) => ({ connectedToSession: connected, waitingForRoundEnd: !!state.sessionStarted })),
	guessPrice: price => set(() => ({ waitingForResults: true, guessedPrice: price })),
	updatePlayersLeft: left => set(() => ({ playersLeft: left })),

	//Players who reconnect will always wait until the next round starts
	reset: () => set(() => initialState),
}));
