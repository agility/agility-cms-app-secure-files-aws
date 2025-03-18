/* eslint-disable @next/next/no-img-element */
import { TextInputAddon } from "@agility/plenum-ui"
import { useCallback, useEffect, useMemo, useState } from "react"
import { debounce } from "underscore"
import Loader from "./Loader"
import FileRow from "./FileRow"

import { DropZone } from "./DropZone"
import InfiniteScroll from "react-infinite-scroll-component"
import { getFileListing } from "@/lib/get-file-listing"
import { BlobListResponseItem } from "@/types/BlobListResponseItem"

interface Props {
	bucketName: string
	accessKeyId: string
	secretAccessKey: string
	region: string
	onSelect: (file: BlobListResponseItem) => void
}

export default function FileListing({ accessKeyId, bucketName, region, secretAccessKey, onSelect: onSelect }: Props) {

	const [cursor, setCursor] = useState<string>("")
	const [filter, setFilter] = useState("")
	const [filterValueBounced, setfilterValueBounced] = useState<string>("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<any>(null)
	const [data, setData] = useState<BlobListResponseItem[]>([])


	const setfilterValueAndDebounce = (val: string) => {
		setFilter(val)
		debouncefilterValue(val)
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncefilterValue = useCallback(
		//handle the search change - use debounce to limit how many times per second this is called
		debounce((value: string) => {
			//clear out the pagination cursor
			setCursor("")

			//set the filter
			setfilterValueBounced(value.trim())
		}, 250),
		[]
	)

	const hasMore = useMemo(() => cursor !== "", [cursor])

	const loadNext = useCallback(() => {
		if (loading) return
		if (error) return
		console.log("loadNext", { accessKeyId, bucketName, region, secretAccessKey, cursor })
		getFileListing({ accessKeyId, bucketName, region, secretAccessKey, search: filterValueBounced, cursor })
			.then((res) => {
				console.log("setting cursor", res.cursor)
				setCursor(res.cursor)
				setData((prev) => [...prev, ...res.items])
			}).catch((err) => {
				setError(err)
			}).finally(() => {
				setLoading(false)
			})

	}, [accessKeyId, bucketName, cursor, filterValueBounced, region, secretAccessKey])

	useEffect(() => {

		//load the first page of files, or when the filter changes
		setLoading(true)
		setError(null)
		setCursor("")
		setData([])
		loadNext()
	}, [filterValueBounced, loadNext])

	return (
		<DropZone className="flex flex-col h-full"
			readOnly={false}
			accessKeyId={accessKeyId}
			bucketName={bucketName}
			region={region}
			secretAccessKey={secretAccessKey}
			onUpload={onSelect}>

			<div className="flex items-center gap-2">
				<div className="p-1 flex-1">
					<TextInputAddon
						placeholder="Starts with..."
						isFocused
						type="search"
						value={filter}
						onChange={(str) => setfilterValueAndDebounce(str.trim())}
					/>
				</div>

			</div>
			{loading && (
				<div className="flex flex-col flex-1 h-full justify-center items-center min-h-0">
					<div className="flex gap-2 items-center text-gray-500">
						<Loader className="!h-6 !w-6 " />
						<div>Loading...</div>
					</div>
				</div>
			)}
			{error && <div>Error? {`${error}`}</div>}
			{!loading && !error && data.length == 0 && (
				<div className="p-3 text-sm">No files returned. Drag a file here to upload it.</div>
			)}
			{!loading && !error && data.length > 0 && (
				<div className="min-h-0 flex-1 py-4">
					<div id="scrolling-list-elem" className="scroll-black h-full overflow-y-auto">
						<ul className="space-y-2 p-2 ">
							<InfiniteScroll
								scrollableTarget="scrolling-list-elem"
								dataLength={data.length}
								next={() => loadNext()}
								hasMore={hasMore}
								loader={<h4>Loading...</h4>}

							>

								{data?.map((file) => (
									<li key={file.properties.etag}>

										<FileRow
											item={file}
											onSelect={onSelect}
										/>
									</li>
								))}

							</InfiniteScroll>
						</ul>
					</div>
				</div>
			)}

		</DropZone>
	)
}
