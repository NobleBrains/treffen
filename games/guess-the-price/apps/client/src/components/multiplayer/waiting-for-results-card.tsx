import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useVolatileMpStore } from '@/stores/mp-volatile-store';
import { RoundTimer } from './round-timer';

export const WaitingForResultsCard = () => {
	const playersLeft = useVolatileMpStore(state => state.playersLeft);
	const guessedPrice = useVolatileMpStore(state => state.guessedPrice);

	return (
		<Card className='max-w-fit'>
			<CardHeader>
				<CardTitle>Waiting for guesses</CardTitle>
				<CardDescription>Wait until the round ends or the time runs out. </CardDescription>
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-center gap-4'>
					<div className='text-center'>
						<h1 className='text-2xl font-semibold'>{playersLeft}</h1>
						<p className='text-neutral-600 text-sm'>Players left</p>
					</div>
					<div>-</div>
					<RoundTimer />
				</div>

				<hr className='my-4' />

				<div className='text-center'>
					<h1 className='text-md'>
						Your guess: <span className='font-semibold'>{guessedPrice}$</span>
					</h1>
				</div>
			</CardContent>
		</Card>
	);
};
