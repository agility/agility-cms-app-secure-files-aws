import { BlobListResponseItem } from '@/types/BlobListResponseItem';
import {
	PutObjectCommand,
	ListObjectsCommand,
	S3Client,
	S3ClientConfig,

} from '@aws-sdk/client-s3';
import { DateTime } from 'luxon';
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {

	try {

		const formData = await request.formData();

		const blobName = formData.get("blobName") as string
		const region = formData.get("region") as string
		const contentType = formData.get("contentType") as string
		const accessKeyId = formData.get("accessKeyId") as string
		const bucketName = formData.get("bucketName") as string

		const file = formData.get("file") as File;
		const arrayBuffer = await file.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);

		const secretAccessKey = (request.headers.get("Authorization") || '').replace('Bearer ', '')


		const s3Config: S3ClientConfig = {
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
			region,
		};

		const s3Client = new S3Client(s3Config);

		const command = new PutObjectCommand({ Bucket: bucketName, Key: blobName, Body: buffer, ContentType: contentType });
		const putRes = await s3Client.send(command);

		//get the listing response for this file...
		const listCommand = new ListObjectsCommand({ Bucket: bucketName, MaxKeys: 1, Prefix: blobName });
		const fileRes = await s3Client.send(listCommand);

		const blobItem: BlobListResponseItem = {
			name: blobName,
			properties: {
				etag: putRes.ETag || "",

				lastModified: DateTime.now().toISODate() || "",
				contentLength: putRes.Size || 0,
				contentType: contentType
			}
		}

		if (fileRes.Contents?.length === 1) {
			blobItem.properties.contentLength = fileRes.Contents[0].Size || 0
			blobItem.properties.lastModified = fileRes.Contents[0].LastModified?.toISOString() || ""

		}

		return NextResponse.json({ status: "success", blobItem });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ status: "fail", error: e });
	}

}
