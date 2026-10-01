import { GuessCard } from '@/components/classic-mode/guess-card';
import { OutgoingEvents } from '@/interfaces/mp-events.types';
import { PlayerJoinsOutgoingPayload } from '@/interfaces/mp-payloads.types';
import { ProductCard } from '@/components/classic-mode/product-card';
import { RoundTimer } from '@/components/multiplayer/round-timer';
import { ShareSessionCard } from '@/components/multiplayer/share-session-card';
import { SignOut } from '@phosphor-icons/react';
import { socket } from '@/socket';
import { useEffect } from 'react';
import { useMpNotifications } from '@/hooks/use-multiplayer-notification';
import { useMpStore } from '@/stores/mp-store';
import { useMultiplayerConnection } from '@/hooks/use-multiplayer-connection';
import { useMultiplayerSession } from '@/hooks/use-multiplayer-session';
import { useParams } from 'react-router-dom';
import { useVolatileMpStore } from '@/stores/mp-volatile-store';
import { WaitingForResultsCard } from '@/components/multiplayer/waiting-for-results-card';
import { RoundResultsCard } from '@/components/multiplayer/round-results-card';
import { SessionResultsCard } from '@/components/multiplayer/session-results-card';
import { WaitingRoundEndCard } from '@/components/multiplayer/waiting-round-end-card';
import { DestructiveActionButton } from '@/components/ui/confirmation-dialog';
import { AnimatePresence, motion } from 'framer-motion';

export const MultiplayerPage = () => {
	const { id } = useParams();
	const mpStore = useMpStore();
	const mpVolatileStore = useVolatileMpStore();
	useMpNotifications();

	const { connectToExistingSession, leaveSession } = useMultiplayerConnection();
	const { hostStartRound, hostEndSession, hostTerminateSession, hostRestartSession, guessPrice } =
		useMultiplayerSession();

	useEffect(() => {
		if (id && !mpStore.playerId && !mpStore.sessionId) {
			connectToExistingSession(id);
		}
	}, [id, connectToExistingSession, mpStore.playerId, mpStore.sessionId]);

	useEffect(() => {
		const playerJoinsSession = (payload: PlayerJoinsOutgoingPayload) => {
			if (payload.playerName === mpStore.playerName) return;
			mpStore.setPlayers(payload.players);
		};

		socket.on(OutgoingEvents.PLAYER_JOINS_SESSION, playerJoinsSession);

		return () => {
			socket.off(OutgoingEvents.PLAYER_JOINS_SESSION, playerJoinsSession);
		};
	}, []);

	return (
		<div>
			<div className='mb-10 flex justify-between items-start md:items-end'>
				<div>
					<h1 className='font-semibold text-3xl'>Multiplayer</h1>
					<p className='text-zinc-600 dark:text-zinc-400'>Play the classic mode with your friends.</p>
				</div>

				<div>
					<DestructiveActionButton
						title='Are you sure?'
						description='Once you leave the session you cannot rejoin with the same name. Meaning that if you rejoin you will appear as a new person and will loose track of your guesses.'
						onConfirm={leaveSession}
					>
						<SignOut size={24} /> <span className='hidden md:block'>Leave session</span>
					</DestructiveActionButton>
				</div>
			</div>

			<AnimatePresence>
				{mpVolatileStore.waitingForRoundEnd ? (
					<div className='flex items-center justify-center h-[200px]'>
						<WaitingRoundEndCard />
					</div>
				) : (
					<div>
						{!mpVolatileStore.sessionStarted && (
							<div className='flex items-center justify-center'>
								<ShareSessionCard
									isHost={mpStore.isHost}
									playerName={mpStore.playerName}
									sessionId={mpStore.sessionId}
									playerNumber={mpStore.players}
									onStart={hostStartRound}
								/>
							</div>
						)}

						{mpVolatileStore.currentlyPlaying &&
							mpVolatileStore.roundData.product &&
							!mpVolatileStore.waitingForResults && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.5 }}
									className='flex gap-6 flex-col md:flex-row'
								>
									<ProductCard
										image={mpVolatileStore.roundData.product?.image}
										priceInfo={mpVolatileStore.roundData.product?.priceMessage ?? ''}
										source={mpVolatileStore.roundData.product?.source ?? ''}
										title={mpVolatileStore.roundData.product?.name}
									/>

									<div className='md:flex-1'>
										<GuessCard onGuess={guessPrice} />
										<div className='p-4 bg-white border dark:bg-transparent dark:border-zinc-800 rounded-md mt-4 w-full'>
											<RoundTimer />
										</div>
									</div>
								</motion.div>
							)}

						{mpVolatileStore.waitingForResults && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5 }}
								className='w-full flex items-center justify-center'
							>
								<WaitingForResultsCard />
							</motion.div>
						)}

						{mpVolatileStore.showingRoundResults && (
							<>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.5 }}
									className='flex gap-6 flex-col md:flex-row'
								>
									<ProductCard
										image={mpVolatileStore.roundData.product?.image ?? ''}
										priceInfo={mpVolatileStore.roundData.product?.priceMessage ?? ''}
										source={mpVolatileStore.roundData.product?.source ?? ''}
										title={mpVolatileStore.roundData.product?.name ?? ''}
										price={mpVolatileStore.roundData.product?.price ?? 0}
									/>
									<div className='md:flex-1'>
										<RoundResultsCard
											isHost={mpStore.isHost}
											results={mpVolatileStore.roundData.results ?? []}
											playerName={mpStore.playerName}
											onEndSession={hostEndSession}
											onNextRound={hostStartRound}
										/>
									</div>
								</motion.div>
							</>
						)}

						{mpVolatileStore.showingSessionResults && (
							<SessionResultsCard
								results={mpVolatileStore.sessionData.sessionResults ?? []}
								roundsPlayed={mpVolatileStore.sessionData.roundsPlayed}
								isHost={mpStore.isHost}
								onTerminateSession={hostTerminateSession}
								onContinuePlaying={hostRestartSession}
							/>
						)}
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};
