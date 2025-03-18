import { BlobListResponse } from "@/app/api/get-files/route"
import { getFileListing } from "@/lib/get-file-listing"
import useSWR from "swr"

interface Props {
	containerName: string
	connectionString: string
	search: string
	cursor: string
}



export default function useFileListing({ connectionString, containerName, search, cursor }: Props) {

	const { data, error, isLoading } = useSWR(`/api/get-files-${connectionString}-${containerName}-${search}-${cursor}`, async () => {
		return getFileListing({ connectionString, containerName, search, cursor })
	})

	return {
		data,
		isLoading,
		error
	}

}