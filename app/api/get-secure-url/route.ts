import {
	GetObjectCommand,
	S3Client,
	S3ClientConfig,

} from '@aws-sdk/client-s3';

import {
	getSignedUrl,
	S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";


import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest, response: NextResponse) {

	const searchParams = request.nextUrl.searchParams
	const bucketName = searchParams.get("bucketName") || ""

	const region = searchParams.get("region") || ""
	const accessKeyId = searchParams.get("accessKeyId") || ""
	const secretAccessKey = (request.headers.get("secretAccessKey") || '').replace('Bearer ', '')
	const blobName = searchParams.get("blobName") || ""

	const s3Config: S3ClientConfig = {
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	};

	const s3Client = new S3Client(s3Config);

	const command = new GetObjectCommand({ Bucket: bucketName, Key: blobName });

	const signedUrlRes = await getSignedUrl(s3Client, command, { expiresIn: 300 });

	return NextResponse.json({ url: signedUrlRes })
}
