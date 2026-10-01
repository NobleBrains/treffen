import CountUp from 'react-countup';

interface Props {
	price: number;
	animate?: boolean;
	animationDuration?: number;
	className?: string;
}

export const PriceContainer = ({ className, price, animate, animationDuration }: Props) => {
	return (
		<h2 className={className}>
			{(import.meta.env.VITE_CURRENCY_SYMBOL_LOCATION ?? "before") === 'before' && (import.meta.env.VITE_CURRENCY_SYMBOL ?? '$')}
			<CountUp end={price} decimal='.' decimals={2} duration={animate ? (animationDuration ?? 0.5) : 0.01} />
			{import.meta.env.VITE_CURRENCY_SYMBOL_LOCATION === 'after' && (import.meta.env.VITE_CURRENCY_SYMBOL ?? '€')}
		</h2>
	);
};
