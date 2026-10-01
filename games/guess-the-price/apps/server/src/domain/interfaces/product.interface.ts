export interface Product {
	name: string;
	image: string;
	price: number;
	priceDescription?: string | null;
	description?: string | null;
	source?: string | null;
}

export interface RandomProduct {
	id: string;
	name: string;
	description: string | null;
	image: string;
	source: string | null;
	price: number;
	priceMessage: string | null;
	category: {
		name: string;
	} | null;
}
