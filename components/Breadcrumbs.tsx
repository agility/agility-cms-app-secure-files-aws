import { IconChevronRight, IconHome } from "@tabler/icons-react"
import { BreadcrumbsProps } from "@/types/ComponentProps"

export default function Breadcrumbs({ currentPath, onNavigate }: BreadcrumbsProps) {
	const pathParts = currentPath.split('/').filter(part => part !== '')
	
	return (
		<nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 p-2">
			<button
				onClick={() => onNavigate('')}
				className={`flex items-center hover:text-gray-700 focus:outline-none ${
					!currentPath ? 'font-medium text-gray-900' : ''
				}`}
							>
					<IconHome className="h-4 w-4" />
				</button>
			
			{pathParts.map((part, index) => {
				const partPath = pathParts.slice(0, index + 1).join('/') + '/'
				const isLast = index === pathParts.length - 1
				
				return (
					<div key={index} className="flex items-center">
						<IconChevronRight className="h-4 w-4 mx-1" />
						<button
							onClick={() => onNavigate(partPath)}
							className={`hover:text-gray-700 focus:outline-none ${
								isLast ? 'font-medium text-gray-900' : ''
							}`}
						>
							{part}
						</button>
					</div>
				)
			})}
		</nav>
	)
} 