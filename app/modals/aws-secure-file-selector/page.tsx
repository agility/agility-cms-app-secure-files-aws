/* eslint-disable @next/next/no-img-element */
"use client"

import FileListing from "@/components/FileListing"
import { useAgilityAppSDK, closeModal, setHeight } from "@agility/app-sdk"
import { Button } from "@agility/plenum-ui"

export default function SelectBigCommerceProduct() {
	const { initializing, appInstallContext } = useAgilityAppSDK()

	const bucketName = appInstallContext?.configuration?.bucketName || ""
	const accessKeyId = appInstallContext?.configuration?.AWS_ACCESS_KEY_ID || ""
	const secretAccessKey = appInstallContext?.configuration?.AWS_SECRET_ACCESS_KEY || ""
	const region = appInstallContext?.configuration?.AWS_REGION || ""

	if (initializing) {
		return null
	}


	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 min-h-0">
				<FileListing
					bucketName={bucketName}
					secretAccessKey={secretAccessKey}
					accessKeyId={accessKeyId}
					region={region}
					onSelect={(product) => {
						closeModal(product)
					}}
				/>
			</div>
			<div className="flex justify-end p-1">
				<Button
					type="alternative"
					label="Cancel"
					className="w-24"
					onClick={() => {
						closeModal(null)
					}}
				/>
			</div>
		</div>
	)
}
