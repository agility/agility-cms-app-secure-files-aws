export interface BlobListResponseItem {
	name: string
	label?: string
	properties: {
		etag: string
		lastModified: string
		contentLength: number
		contentType: string
	}
}

export interface BlobListResponse {
	items: BlobListResponseItem[]
	cursor: string
}