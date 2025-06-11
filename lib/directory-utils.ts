import { FileItem } from '@/types/BlobListResponseItem';
import { DirectoryContentsOptions, DirectoryInfo } from '@/types/ApiTypes';

export interface DirectoryContentsResult {
	files: FileItem[];
	totalCount: number;
	cursor?: string;
	directoryPath: string;
	hasMore: boolean;
}

/**
 * Fetch all files within a directory (including subdirectories)
 * Useful for building image galleries, file listings, etc.
 */
export async function getDirectoryContents(options: DirectoryContentsOptions): Promise<DirectoryContentsResult> {
	const { bucketName, accessKeyId, secretAccessKey, region, directoryPath, maxKeys = 100, cursor } = options;

	const params = new URLSearchParams({
		bucketName,
		accessKeyId,
		region,
		path: directoryPath,
		maxKeys: maxKeys.toString(),
	});

	if (cursor) {
		params.append('cursor', cursor);
	}

	const response = await fetch(`/api/get-directory-contents?${params.toString()}`, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Authorization': `Bearer ${secretAccessKey}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch directory contents: ${response.statusText}`);
	}

	const data = await response.json();
	
	return {
		...data,
		hasMore: !!data.cursor
	};
}

/**
 * Get metadata about a directory (file count, total size, last modified)
 */
export async function getDirectoryInfo(options: Omit<DirectoryContentsOptions, 'maxKeys' | 'cursor'>): Promise<DirectoryInfo> {
	const { bucketName, accessKeyId, secretAccessKey, region, directoryPath } = options;

	const params = new URLSearchParams({
		bucketName,
		accessKeyId,
		region,
		path: directoryPath,
	});

	const response = await fetch(`/api/get-directory-info?${params.toString()}`, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Authorization': `Bearer ${secretAccessKey}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch directory info: ${response.statusText}`);
	}

	return await response.json();
}

/**
 * Generate secure URLs for all files in a directory
 * Useful for creating image galleries with secure access
 */
export async function getDirectoryWithSecureUrls(options: DirectoryContentsOptions): Promise<(FileItem & { secureUrl?: string })[]> {
	const { bucketName, accessKeyId, secretAccessKey, region, directoryPath } = options;
	
	// First, get all files in the directory
	const { files } = await getDirectoryContents(options);
	
	// Generate secure URLs for each file
	const filesWithUrls = await Promise.allSettled(
		files.map(async (file) => {
			try {
				const params = new URLSearchParams({
					bucketName,
					blobName: file.name,
					region,
					accessKeyId,
				});

				const response = await fetch(`/api/get-secure-url?${params.toString()}`, {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'Authorization': `Bearer ${secretAccessKey}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					return { ...file, secureUrl: data.url };
				} else {
					console.warn(`Failed to get secure URL for ${file.name}`);
					return { ...file, secureUrl: undefined };
				}
			} catch (error) {
				console.warn(`Error getting secure URL for ${file.name}:`, error);
				return { ...file, secureUrl: undefined };
			}
		})
	);

	// Return successful results, filtering out failed ones
	return filesWithUrls
		.filter((result) => result.status === 'fulfilled')
		.map((result) => (result as PromiseFulfilledResult<FileItem & { secureUrl?: string }>).value);
}

/**
 * Helper function to filter files by type (for image galleries, etc.)
 */
export function filterFilesByType(files: FileItem[], types: string[]): FileItem[] {
	return files.filter(file => {
		const extension = file.name.split('.').pop()?.toLowerCase();
		return extension && types.includes(extension);
	});
}

/**
 * Helper function to get only image files
 */
export function getImageFiles(files: FileItem[]): FileItem[] {
	return filterFilesByType(files, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp']);
}

/**
 * Helper function to get only document files
 */
export function getDocumentFiles(files: FileItem[]): FileItem[] {
	return filterFilesByType(files, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']);
}

/**
 * Helper function to get only video files
 */
export function getVideoFiles(files: FileItem[]): FileItem[] {
	return filterFilesByType(files, ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm']);
} 