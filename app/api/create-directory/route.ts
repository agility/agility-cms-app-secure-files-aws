import { S3Client, PutObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const { bucketName, directoryPath, region, accessKeyId } = await request.json();
	const secretAccessKey = (request.headers.get("Authorization") || '').replace('Bearer ', '');

	if (!bucketName || !directoryPath || !region || !accessKeyId || !secretAccessKey) {
		return NextResponse.json(
			{ error: "Missing required parameters" },
			{ status: 400 }
		);
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
		// Ensure the directory path ends with /
		const normalizedPath = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`;

		// Create an empty object to represent the directory
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: normalizedPath,
			Body: '',
			ContentType: 'application/x-directory',
		});

		await s3Client.send(command);

		return NextResponse.json({ 
			success: true, 
			directoryPath: normalizedPath 
		});
	} catch (error) {
		console.error('Error creating directory:', error);
		return NextResponse.json(
			{ error: "Failed to create directory" },
			{ status: 500 }
		);
	}
} 