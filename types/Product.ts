export interface Product {
	entityId: number
	image: {
		listingUrl: string
		detailUrl: string
	}
	id: string
	name: string
	path: string
	description: string
	sku: string
}