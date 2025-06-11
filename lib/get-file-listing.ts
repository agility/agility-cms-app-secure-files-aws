import { BlobListResponse } from "@/types/BlobListResponseItem"


import { GetFileListingProps } from '@/types/ApiTypes';

export const getFileListing = async ({ accessKeyId, bucketName, region, secretAccessKey, cursor, search, currentPath = "" }: GetFileListingProps) => {
	const res = await fetch(`/api/get-files?bucketName=${encodeURIComponent(bucketName)}&search=${encodeURIComponent(search)}&cursor=${encodeURIComponent(cursor)}&region=${encodeURIComponent(region)}&accessKeyId=${encodeURIComponent(accessKeyId)}&currentPath=${encodeURIComponent(currentPath)}`, {
		method: "GET",
		headers: {
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + secretAccessKey,
		}
	})

	if (res.ok) {
		const data = await res.json() as BlobListResponse

		return data || null
	}

	throw new Error("Could not get Files")

}