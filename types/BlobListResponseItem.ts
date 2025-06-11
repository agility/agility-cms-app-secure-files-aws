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

export interface DirectoryItem {
	name: string
	type: 'directory'
	fullPath: string
	label?: string
	metadata?: {
		fileCount?: number
		lastModified?: string
		totalSize?: number
	}
}

export interface FileItem extends BlobListResponseItem {
	type: 'file'
	// Optional fields for directory contents API
	relativePath?: string
	displayName?: string
}

export type BlobItem = FileItem | DirectoryItem

export interface BlobListResponse {
	items: BlobItem[]
	cursor: string
	currentPath: string
}

// Field value can be either a file or directory selection
export type FieldValue = FileItem | DirectoryItem