import classNames from "classnames"
import { IconFolder, IconCheck } from "@tabler/icons-react"
import { DirectoryRowProps } from "@/types/ComponentProps"

export default function DirectoryRow({ item, onNavigate, onSelectDirectory }: DirectoryRowProps) {
	return (
		<div className="flex flex-row items-center rounded shadow border border-gray-100 p-2 gap-3 hover:bg-gray-50">
			<div className="flex-shrink-0">
				<IconFolder className="h-6 w-6 text-gray-600" />
			</div>
			<div 
				className="flex-1 cursor-pointer"
				onClick={() => onNavigate(item.fullPath)}
			>
				<div className="text-sm font-medium text-gray-900 hover:text-gray-700">{item.name}</div>
			</div>

			<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all">
				—
			</div>

			<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all">
				—
			</div>

			<div className="flex gap-2">
				<button
					type="button"
					className={classNames("inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500")}
					onClick={() => onNavigate(item.fullPath)}
				>
					Open
				</button>
				{onSelectDirectory && (
					<button
						type="button"
						className={classNames("inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500")}
						onClick={(e) => {
							e.stopPropagation()
							onSelectDirectory(item.fullPath)
						}}
						title={`Select directory: ${item.name}`}
					>
						Select
					</button>
				)}
			</div>
		</div>
	)
} 