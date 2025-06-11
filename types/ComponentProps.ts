import { FileItem, DirectoryItem } from './BlobListResponseItem'

// Component Props Interfaces
export interface FileRowProps {
	item: FileItem
	onSelect: (item: FileItem) => void
}

export interface DirectoryRowProps {
	item: DirectoryItem
	onNavigate: (directoryPath: string) => void
	onSelectDirectory?: (directoryPath: string) => void
}

export interface FileListingProps {
	bucketName: string
	accessKeyId: string
	secretAccessKey: string
	region: string
	onSelect: (file: FileItem) => void
	onSelectDirectory?: (directoryPath: string) => void
}

export interface BreadcrumbsProps {
	currentPath: string
	onNavigate: (path: string) => void
}

export interface FileIconProps {
	file: FileItem
	size?: 'sm' | 'md' | 'lg'
}

export interface LoaderProps {
	className?: string
}

export interface FieldHeaderProps {
	title: string
	description?: string
	isRequired?: boolean
	helpText?: string
}

export interface DropZoneProps {
	className?: string
	readOnly: boolean
	accessKeyId: string
	bucketName: string
	region: string
	secretAccessKey: string
	onUpload: (file: FileItem) => void
	currentPath: string
	children: React.ReactNode
}

export interface EmptySectionProps {
	icon: JSX.Element
	messageHeading: string
	messageBody: string
	buttonComponent?: JSX.Element
}

export interface IconWithShadowProps {
	icon: React.ReactNode
	className?: string
} 