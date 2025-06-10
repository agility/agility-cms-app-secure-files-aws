import { BlobListResponse, FileItem, DirectoryItem, BlobItem } from '@/types/BlobListResponseItem';
import {
	ListObjectsV2Command,
	S3Client,
	S3ClientConfig,
} from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {

	const searchParams = request.nextUrl.searchParams
	const bucketName = searchParams.get("bucketName") || ""
	const cursor = searchParams.get("cursor") || ""
	const region = searchParams.get("region") || ""
	const accessKeyId = searchParams.get("accessKeyId") || ""
	const secretAccessKey = (request.headers.get("Authorization") || '').replace('Bearer ', '')
	const search = `${searchParams.get("search") || ""}`.replaceAll("\"", "")
	const currentPath = `${searchParams.get("currentPath") || ""}`.replaceAll("\"", "")

	const s3Config: S3ClientConfig = {
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	};

	const s3Client = new S3Client(s3Config);

	// Combine currentPath and search for the prefix
	let prefix = currentPath
	if (search) {
		prefix = currentPath ? `${currentPath}${search}` : search
	}

	const command = new ListObjectsV2Command({
		Bucket: bucketName,
		Prefix: prefix,
		MaxKeys: 20,
		ContinuationToken: cursor || undefined,
		Delimiter: "/"
	});
	const fileRes = await s3Client.send(command);

	let data: BlobListResponse = {
		items: [],
		cursor: fileRes.NextContinuationToken || "",
		currentPath: currentPath
	}

	// Add directories (CommonPrefixes)
	for (const commonPrefix of fileRes.CommonPrefixes || []) {
		if (!commonPrefix.Prefix) continue;
		
		// Extract directory name from the prefix
		const directoryPath = commonPrefix.Prefix;
		const directoryName = directoryPath.replace(currentPath, '').replace('/', '');
		
		if (directoryName) {
			const directoryItem: DirectoryItem = {
				name: directoryName,
				type: 'directory',
				fullPath: directoryPath
			}
			data.items.push(directoryItem)
		}
	}

	// Add files (Contents)
	for (const blob of fileRes.Contents || []) {
		if (!blob.Key) {
			continue
		}

		// Skip if this is actually a directory (ends with /)
		if (blob.Key.endsWith('/')) {
			continue
		}

		// Extract just the filename from the full path
		const fileName = blob.Key.replace(currentPath, '')
		
		// Skip if this file is in a subdirectory (contains /)
		if (fileName.includes('/')) {
			continue
		}

		const fileItem: FileItem = {
			name: blob.Key,
			type: 'file',
			displayName: fileName,
			properties: {
				etag: blob.ETag || "",
				lastModified: blob.LastModified?.toISOString() || "",
				contentLength: blob.Size || 0,
				contentType: ""
			}
		}

		data.items.push(fileItem)
	}

	return NextResponse.json(data)
}
