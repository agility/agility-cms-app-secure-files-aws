import IconWithShadow from "./IconWithShadow"

interface IEmptySectionProps {
	icon: JSX.Element
	/**
	 * The message heading.
	 *
	 * @type {string}
	 * @memberof IEmptySectionProps
	 */
	messageHeading: string
	/**
	 * The message body. Use \n to create a new line.
	 *
	 * @type {string}
	 * @memberof IEmptySectionProps
	 */
	messageBody: string
	buttonComponent?: JSX.Element
}

export default function EmptySection({icon, messageBody, messageHeading, buttonComponent}: IEmptySectionProps) {
	return (
		<div
			className={
				"flex h-full w-full flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-white p-6 transition-opacity"
			}
		>
			<div className="text-center">
				<IconWithShadow icon={icon || undefined} />
				<p className="mt-4 mb-2 block text-sm font-medium text-gray-900">{messageHeading}</p>
				<p
					className="mb-2 block max-w-[600px] text-sm font-medium text-gray-500"
					dangerouslySetInnerHTML={{
						__html: messageBody.replaceAll("\n", "<br/>"),
					}}
				></p>
			</div>
			{buttonComponent}
		</div>
	)
}
