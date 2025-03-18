import { BlobListResponse } from "@/types/BlobListResponseItem"


interface Props {
	bucketName: string
	accessKeyId: string
	secretAccessKey: string
	region: string
	search: string
	cursor: string
}

export const getFileListing = async ({ accessKeyId, bucketName, region, secretAccessKey, cursor, search }: Props) => {
	const res = await fetch(`/api/get-files?bucketName=${encodeURIComponent(bucketName)}&search=${encodeURIComponent(search)}&cursor=${encodeURIComponent(cursor)}&region=${encodeURIComponent(region)}&accessKeyId=${encodeURIComponent(accessKeyId)}`, {
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