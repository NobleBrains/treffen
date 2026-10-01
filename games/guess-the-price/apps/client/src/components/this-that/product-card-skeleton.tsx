import { Card } from '../ui/card';

export const ProductCardSkeleton = () => {
	return (
		<Card className='p-6 w-full'>
			<div className='flex lg:flex-row flex-col gap-4'>
				<div className='w-full rounded-sm h-[300px] bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
				<div className='w-full'>
					<div className='w-3/4 rounded-sm h-6 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
					<div className='w-1/2 rounded-sm h-4 mt-2 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
					<div className='w-1/2 rounded-sm h-4 mt-2 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
					<div className='w-1/2 rounded-sm h-4 mt-2 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
					<div className='w-1/2 rounded-sm h-4 mt-2 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
				</div>
			</div>
			<div className='w-full mt-6 rounded-sm h-10 bg-zinc-100 dark:bg-zinc-800 animate-pulse' />
		</Card>
	);
};
