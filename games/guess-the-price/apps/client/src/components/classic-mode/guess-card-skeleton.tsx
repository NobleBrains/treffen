import { Card } from '../ui/card';

export const GuessCardSkeleton = () => {
	return (
		<Card className='max-h-fit md:min-w-[350px] flex-1'>
			<div className='p-6 space-y-4'>
				<div className='w-full rounded-sm h-6 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
				<div className='w-full rounded-sm h-12 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
				<div className='w-full rounded-sm h-12 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
			</div>
		</Card>
	);
};
