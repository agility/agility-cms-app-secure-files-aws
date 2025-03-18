
import { BlobListResponseItem } from "@/types/BlobListResponseItem";
import axios from "axios";
import { useState } from "react";

interface Props {
	bucketName: string
	accessKeyId: string
	secretAccessKey: string
	region: string
	onUpload: (file: BlobListResponseItem) => void
}

export const useUpload = ({ accessKeyId, bucketName, region, secretAccessKey, onUpload }: Props) => {

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
		formData.append("blobName", file.name);
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
				onUpload(blobItem)
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