import {default as cn} from "classnames"

interface LoaderProps {
	className?: string
}

export default function Loader({className}: LoaderProps): JSX.Element {
	return (
		<div
			className={cn(
				"inline-block animate-spin rounded-full border-purple-700 border-r-gray-200",
				"m-auto h-16 w-16 border-2",
				className
			)}
			role="status"
		></div>
	)
}
