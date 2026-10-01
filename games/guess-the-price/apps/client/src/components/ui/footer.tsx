import { GithubLogo } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const Footer = () => {
	return (
		<footer className='p-5 '>
			<hr className='mb-4 dark:border-zinc-400' />
			<div className='flex flex-col gap-4 md:flex-row md:gap-0 md:justify-between dark:text-zinc-400 text-zinc-800 items-center'>
				<p className='dark:text-zinc-400 text-zinc-700 flex items-center justify-start gap-2 text-sm'>
					<span className='text-lg'>©</span> Guess the price {new Date().getFullYear()}
				</p>

				<p className='dark:text-zinc-400 text-zinc-700 text-sm'>
					Prices and products are for entertainment only; we are not affiliated with any company.
				</p>

				{import.meta.env.VITE_SHOW_GITHUB_LINK === 'true' && (
					<Link to='https://github.com/pavece/guess-the-price' className='flex gap-2 underline'>
						<GithubLogo size={24} /> Source code
					</Link>
				)}
			</div>
		</footer>
	);
};
