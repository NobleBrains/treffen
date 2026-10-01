import { Copy, Joystick } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

interface Props {
	isHost: boolean;
	sessionId: string;
	playerNumber: number;
	playerName: string;
	onStart?: () => void;
}

export const ShareSessionCard = ({ isHost, sessionId, playerNumber, playerName, onStart }: Props) => {
	const onCopyLink = () => {
		navigator.clipboard.writeText(`${window.location.origin}/multiplayer/${sessionId}`);
		toast.info('Session-Link kopiert!');
	};

	return (
		<>
			<div className='max-w-[750px]'>
				<Card>
					<CardHeader>
						<CardTitle>You are</CardTitle>
						<CardDescription>Hope you like your randomly generated name!</CardDescription>
					</CardHeader>
					<CardContent className='text-center'>
						<h2 className='text-xl font-semibold'>{playerName}</h2>
					</CardContent>
				</Card>
				<Card className=' mt-5 w-fit'>
					<CardHeader>
						<CardTitle>Invite your friends</CardTitle>
						<CardDescription>
							{isHost
								? 'Share this link with your friends and when you are ready click play.'
								: 'Waiting for the host to start the round.'}
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className='flex items-center justify-center flex-col mb-5'>
							<h1 className='text-2xl'>{playerNumber ?? 1}</h1>
							<p className='text-neutral-800 dark:text-zinc-400'>Players in session</p>
						</div>

						<p className='hidden md:block text-md'>Share this link:</p>
						<p className='hidden md:block font-sm font-medium'>{typeof window !== 'undefined' ? window.location.origin : ''}/multiplayer/{sessionId}</p>
						<Button className='mt-2 w-full' onClick={onCopyLink}>
							<Copy size={24} /> Copy session link
						</Button>
					</CardContent>
					{isHost && (
						<CardFooter className='border-t-[1px] dark:border-zinc-800 pt-4 flex-col'>
							<Button className='w-full' onClick={onStart}>
								<Joystick size={24} /> Play
							</Button>
							<p className='text-sm text-neutral-600 dark:text-zinc-400 mt-1'>
								* You are the host of the session. Click play whenever you want to start the session. Players can still
								join once the session has stared.
							</p>
						</CardFooter>
					)}
				</Card>
			</div>
		</>
	);
};
