import { IconFolder } from "@tabler/icons-react"
import { formatDateTime } from "@/lib/format"
import { DirectoryRowProps } from "@/types/ComponentProps"

export default function DirectoryRow({ item, onNavigate, onSelectDirectory }: DirectoryRowProps) {
	return (
		<div className="flex flex-row items-center rounded shadow border border-gray-100 p-2 gap-3">
			<div className="flex-shrink-0">
				<IconFolder className="h-10 w-10 text-gray-600" />
			</div>
			<div className="flex-1">
				<div className="text-sm font-medium text-gray-900">{item.name}</div>
				<div className="text-sm text-gray-500">Directory</div>
			</div>

			<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all">
				{item.metadata?.fileCount !== undefined ? `${item.metadata.fileCount} items` : '--'}
			</div>

			<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all">
				{item.metadata?.lastModified ? formatDateTime(item.metadata.lastModified) : '--'}
			</div>

			<div className="flex gap-2">
				<button
					type="button"
					className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
					onClick={() => onNavigate(item.fullPath)}
				>
					Open
				</button>
				{onSelectDirectory && (
					<button
						type="button"
						className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
						onClick={() => onSelectDirectory(item.fullPath)}
					>
						Select
					</button>
				)}
			</div>
		</div>
	)
} 