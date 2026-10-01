import { Spinner } from '@phosphor-icons/react';

interface Props {
	className?: string;
}

export const Loading = ({ className }: Props) => {
	return (
		<div className={`flex flex-row items-center justify-center gap-2 ${className}`}>
			<Spinner size={32} className='loading' />
			<h3 className='text-xl font-semibold'>Loading</h3>
		</div>
	);
};
