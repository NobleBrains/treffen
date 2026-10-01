import { useNavigate } from 'react-router-dom';
import { useMultiplayerConnection } from '@/hooks/use-multiplayer-connection';
import { useMpStore } from '@/stores/mp-store';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const MultiplayerJoinPage = () => {
	const navigate = useNavigate();
	const { createSession } = useMultiplayerConnection();
	const [existingSessionId, setSessionId] = useState('');
	const { sessionId } = useMpStore();

	const joinSession = () => {
		if (existingSessionId.length > 0) {
			navigate(`/multiplayer/${existingSessionId}`);
		}
	};

	useEffect(() => {
		if (sessionId) {
			navigate(`/multiplayer/${sessionId}`);
		}
	}, [navigate, sessionId]);

	return (
		<div>
			<div className='mb-10'>
				<h1 className='font-semibold text-3xl'>Multiplayer</h1>
				<p className='text-zinc-600 dark:text-zinc-400'>Create or join a session to start playing with your friends.</p>
			</div>
			<div className='flex gap-4 flex-col md:flex-row'>
				<Card className='w-full h-fit'>
					<CardHeader>
						<CardTitle>Create new session</CardTitle>
						<CardDescription>Create a new session and let your friends join.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className='w-full' onClick={createSession}>
							Create new session
						</Button>
					</CardContent>
				</Card>

				<Card className='w-full h-fit'>
					<CardHeader>
						<CardTitle>Join a session</CardTitle>
						<CardDescription>Join an existing session and play with your friends.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onClick={joinSession}>
							<Input
								placeholder='Enter session code...'
								onChange={e => setSessionId(e.target.value)}
								value={existingSessionId}
							></Input>
							<Button className='w-full mt-4' disabled={existingSessionId.length <= 0} type='submit'>
								Join
							</Button>
						</form>
					</CardContent>
					<CardFooter>
						<p className='text-sm'>
							If your friend sent you a session link just click it. If not enter the session code here.
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};
