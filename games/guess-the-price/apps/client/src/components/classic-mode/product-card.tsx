import { Card, CardContent } from '../ui/card';
import { Image } from '../ui/image';
import { PriceContainer } from '../ui/price-container';

interface Props {
	title: string;
	image: string;
	source: string;
	priceInfo: string;
	price?: number;
}

export const ProductCard = ({ title, image, source, priceInfo, price }: Props) => {
	return (
		<Card className='w-full md:w-[60%] pt-6 '>
			<CardContent className='flex lg:flex-row flex-col gap-4'>
				<Image src={image} alt='Product image' className='md:min-w-[400px]' />

				<div>
					<h2 className='text-xl mb-2 font-semibold'>{title}</h2>

					<h3 className='text-md font-medium'>Source</h3>
					<p className='text-sm dark:text-zinc-200'>{source}</p>
					<h3 className='mt-2 text-md font-medium'>Price information</h3>
					<p className='text-sm dark:text-zinc-200'>{priceInfo}</p>

					{price && (
						<>
							<h3 className='mt-2 text-md font-medium'>Price</h3>
							<PriceContainer price={price} animate={true} className='text-3xl font-bold' animationDuration={1.5} />
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
