import { FileItem } from './BlobListResponseItem'

// API Request/Response Types
export interface GetFileListingProps {
	accessKeyId: string
	bucketName: string
	region: string
	secretAccessKey: string
	search: string
	cursor: string
	currentPath?: string
}



export interface DirectoryContentsOptions {
	bucketName: string
	accessKeyId: string
	secretAccessKey: string
	region: string
	directoryPath: string
	maxKeys?: number
	cursor?: string
}

export interface DirectoryContentsResult {
	files: FileItem[]
	hasMore: boolean
	nextToken?: string
}

export interface DirectoryInfo {
	path: string
	fileCount: number
	totalSize: number
	lastModified?: string
	isEmpty: boolean
}

export interface DirectoryContentsResponse {
	files: FileItem[]
	totalCount: number
	cursor?: string
	directoryPath: string
}

export interface CreateDirectoryRequest {
	bucketName: string
	directoryPath: string
	region: string
	accessKeyId: string
}

export interface CreateDirectoryResponse {
	success: boolean
	directoryPath: string
} 