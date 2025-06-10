import {
	ListObjectsV2Command,
	S3Client,
	S3ClientConfig,
} from '@aws-sdk/client-s3';
import { DirectoryInfo } from '@/types/ApiTypes';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const bucketName = searchParams.get("bucketName") || ""
	const directoryPath = searchParams.get("path") || ""
	const region = searchParams.get("region") || ""
	const accessKeyId = searchParams.get("accessKeyId") || ""
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
		let fileCount = 0;
		let totalSize = 0;
		let lastModified: Date | undefined;
		let continuationToken: string | undefined;

		// Paginate through all objects to get complete metadata
		do {
			const command = new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: directoryPath,
				MaxKeys: 1000, // Process in batches for better performance
				ContinuationToken: continuationToken,
				// No Delimiter - we want all files including those in subdirectories
			});

			const response = await s3Client.send(command);

			// Process all files in this batch
			for (const obj of response.Contents || []) {
				if (!obj.Key) continue;
				
				// Skip directory markers (keys ending with /)
				if (obj.Key.endsWith('/')) continue;
				
				fileCount++;
				totalSize += obj.Size || 0;
				
				// Track the most recent modification date
				if (obj.LastModified) {
					if (!lastModified || obj.LastModified > lastModified) {
						lastModified = obj.LastModified;
					}
				}
			}

			continuationToken = response.NextContinuationToken;
		} while (continuationToken);

		const directoryInfo: DirectoryInfo = {
			path: directoryPath,
			fileCount,
			totalSize,
			lastModified: lastModified?.toISOString(),
			isEmpty: fileCount === 0
		};

		return NextResponse.json(directoryInfo);

	} catch (error) {
		console.error('Error fetching directory info:', error);
		return NextResponse.json(
			{ error: "Failed to fetch directory info" },
			{ status: 500 }
		);
	}
} 