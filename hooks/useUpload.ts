import { BlobListResponseItem, FileItem } from "@/types/BlobListResponseItem";
import axios from "axios";
import { useState } from "react";

interface UseUploadProps {
	bucketName: string
	accessKeyId: string
	secretAccessKey: string
	region: string
	onUpload: (file: FileItem) => void
	currentPath?: string
}

export const useUpload = ({ accessKeyId, bucketName, region, secretAccessKey, onUpload, currentPath = "" }: UseUploadProps) => {

	const [loading, setLoading] = useState(false);

	const [uploadProgress, setUploadProgress] = useState(0);

	//upload the file using fetch to /api/upload and track the progress
	const uploadFile = (file: File) => {
		setLoading(true);
		setUploadProgress(0);
		const formData = new FormData();
		formData.append("file", file);
		formData.append("bucketName", bucketName);
		formData.append("accessKeyId", accessKeyId);
		formData.append("region", region);
		
		// Include currentPath in the blobName to upload to the correct folder
		const blobName = currentPath ? `${currentPath}${file.name}` : file.name;
		formData.append("blobName", blobName);
		formData.append("contentType", file.type);

		const url = `/api/upload`

		axios.post(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'Authorization': 'Bearer ' + secretAccessKey,
			},
			onUploadProgress: (progressEvent) => {
				const { loaded, total } = progressEvent;
				if (total) {
					let precentage = Math.floor((loaded * 100) / total);
					setUploadProgress(precentage);
				}
			}
		}).then((res) => {
			if (res.data.status === "success") {
				const blobItem = res.data.blobItem as BlobListResponseItem
				// Convert to FileItem format
				const fileItem: FileItem = {
					...blobItem,
					type: 'file'
				}
				onUpload(fileItem)
			}
			console.log("File uploaded successfully")
		})
			.catch((err) => { console.error("Failed to upload file") })
			.finally(() => {
				setLoading(false);

			})


	}

	return {
		uploadFile,
		loading,
		uploadProgress
	}
}