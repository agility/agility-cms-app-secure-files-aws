import { FileItem } from '@/types/BlobListResponseItem';
import { DirectoryContentsResponse } from '@/types/ApiTypes';
import {
	ListObjectsV2Command,
	S3Client,
	S3ClientConfig,
} from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const bucketName = searchParams.get("bucketName") || ""
	const directoryPath = searchParams.get("path") || ""
	const region = searchParams.get("region") || ""
	const accessKeyId = searchParams.get("accessKeyId") || ""
	const cursor = searchParams.get("cursor") || ""
	const maxKeys = parseInt(searchParams.get("maxKeys") || "100", 10)
	const secretAccessKey = (request.headers.get("Authorization") || '').replace('Bearer ', '')

	if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
		return NextResponse.json(
			{ error: "Missing required parameters" },
			{ status: 400 }
		)
	}

	const s3Config: S3ClientConfig = {
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	};

	const s3Client = new S3Client(s3Config);

	try {
		// List all objects in the directory (including subdirectories)
		// Note: No delimiter is used so we get all files recursively
		const command = new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: directoryPath,
			MaxKeys: maxKeys,
			ContinuationToken: cursor || undefined,
			// No Delimiter - we want all files including those in subdirectories
		});

		const response = await s3Client.send(command);
		const files: FileItem[] = [];

		// Process all files
		for (const obj of response.Contents || []) {
			if (!obj.Key) continue;
			
			// Skip directory markers (keys ending with /)
			if (obj.Key.endsWith('/')) continue;
			
			// Extract filename from full path for display
			const fileName = obj.Key.split('/').pop() || obj.Key;
			
			const fileItem: FileItem = {
				name: obj.Key, // Full path as name for secure URL generation
				type: 'file',
				properties: {
					etag: obj.ETag || "",
					lastModified: obj.LastModified?.toISOString() || "",
					contentLength: obj.Size || 0,
					contentType: "" // Would need HEAD request to get this
				},
				// Add relative path for display purposes
				relativePath: obj.Key.replace(directoryPath, ''),
				displayName: fileName
			}
			
			files.push(fileItem);
		}

		const result: DirectoryContentsResponse = {
			files,
			totalCount: files.length,
			cursor: response.NextContinuationToken || undefined,
			directoryPath
		};

		return NextResponse.json(result);

	} catch (error) {
		console.error('Error fetching directory contents:', error);
		return NextResponse.json(
			{ error: "Failed to fetch directory contents" },
			{ status: 500 }
		);
	}
} 