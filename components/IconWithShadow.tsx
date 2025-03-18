import { default as cn } from "classnames"


interface Props {
	iconComponent?: any
	iconClassName?: String
	shadowClassName?: string
	icon?: JSX.Element
}

export default function IconWithShadow({
	iconComponent,
	iconClassName,
	shadowClassName,
	icon
}: Props) {
	return (
		<div className="flex flex-col  items-center justify-center ">
			{!!iconComponent && <>{iconComponent}</>}
			{icon && (
				<>{icon}</>
			)}

			<div
				className={cn("mt-1 h-2 w-24 bg-gray-100", shadowClassName)}
				style={{ borderRadius: "40%" }}
			/>
		</div>
	)
}