
import { BlobListResponse, BlobListResponseItem } from '@/types/BlobListResponseItem';
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

	const s3Config: S3ClientConfig = {
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	};

	const s3Client = new S3Client(s3Config);

	const command = new ListObjectsV2Command({
		Bucket: bucketName,
		Prefix: search,
		MaxKeys: 20,
		ContinuationToken: cursor || undefined,
		Delimiter: "/"
	});
	const fileRes = await s3Client.send(command);

	let data: BlobListResponse = {
		items: [],
		cursor: fileRes.NextContinuationToken || ""
	}

	for (const blob of fileRes.Contents || []) {
		if (!blob.Key) {
			continue

		}

		const blobItem: BlobListResponseItem = {
			name: blob.Key,
			properties: {
				etag: blob.ETag || "",
				lastModified: blob.LastModified?.toISOString() || "",
				contentLength: blob.Size || 0,
				contentType: ""
			}
		}

		data.items.push(blobItem)
	}

	return NextResponse.json(data)
}
