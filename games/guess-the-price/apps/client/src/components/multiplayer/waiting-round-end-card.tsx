export const WaitingRoundEndCard = () => {
	return (
		<div className='rounded-md border p-4 bg-white max-w-[600px]'>
			<h1 className='text-xl font-medium'>Please wait until the current round ends...</h1>
			<p className='text-sm text-neutral-600 mt-2'>
				You have connected to this session while a round is running. Please wait until the current round ends.
			</p>
		</div>
	);
};
