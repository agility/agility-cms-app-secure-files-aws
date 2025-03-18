/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { BlobListResponseItem } from "@/app/api/get-files/route"
import { Product } from "@/types/Product"
import { Checkbox } from "@agility/plenum-ui"
import { IconBan, IconCheck, IconFile } from "@tabler/icons-react"
import classNames from "classnames"
import { FileIcon } from "./FileIcon"
import { formatBytes, formatDateTime } from "@/lib/format"

interface Props {

	item: BlobListResponseItem
	onSelect: (item: BlobListResponseItem) => void
}

export default function FileRow({ item, onSelect }: Props) {
	return (
		<div className="flex flex-row items-center rounded shadow border border-gray-100 p-2 gap-3">
			<div className="flex-shrink-0">
				<FileIcon file={item} size="sm" />
			</div>
			<div className="flex-1">
				<div className="text-sm font-medium text-gray-900">{item.name}</div>
				<div className="text-sm text-gray-500 line-clamp-3">{item.properties.contentType}</div>
			</div>


			<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all">
				{formatBytes(item.properties.contentLength)}
			</div>

			<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all">
				{formatDateTime(item.properties.lastModified)}
			</div>


			<div className="">
				<button
					type="button"
					className={classNames("inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500")}
					onClick={() => {
						onSelect(item)
					}}
				>
					Select
				</button>
			</div>
		</div>
	)
}
