/* eslint-disable @next/next/no-img-element */
"use client"

import EmptySection from "@/components/EmptySection"

import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from "@agility/app-sdk"
import { Button, ButtonDropDown, TextInput } from "@agility/plenum-ui"
import { IconFileTypeDocx, IconFileTypePdf, IconFileTypeXls, IconFileUpload, IconFileZip, IconImageInPicture, IconLayoutGrid, IconPhoto, IconVideo } from "@tabler/icons-react"
import { IconChevronDown, IconFile } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { formatBytes, formatDateTime } from "@/lib/format"
import { DropZone } from "@/components/DropZone"
import { useUpload } from "@/hooks/useUpload"
import classNames from "classnames"
import { BlobListResponseItem } from "@/types/BlobListResponseItem"

export default function Field() {
	const { initializing, appInstallContext, field, fieldValue } = useAgilityAppSDK()

	const fileUploadRef = useRef<HTMLInputElement>(null);
	const containerRef = useResizeHeight()

	const bucketName = appInstallContext?.configuration?.bucketName || ""
	const accessKeyId = appInstallContext?.configuration?.AWS_ACCESS_KEY_ID || ""
	const secretAccessKey = appInstallContext?.configuration?.AWS_SECRET_ACCESS_KEY || ""
	const region = appInstallContext?.configuration?.AWS_REGION || ""

	const [selectedFile, onsetSelectedFile] = useState<BlobListResponseItem | null>(null)
	const [sasUrl, setSasUrl] = useState<string | null>(null)

	const setSelectedFile = (file: BlobListResponseItem | null) => {
		onsetSelectedFile(file)
		if (!file) {
			contentItemMethods.setFieldValue({ name: field?.name, value: "" })
		} else {

			const json = JSON.stringify(file)

			contentItemMethods.setFieldValue({ name: field?.name, value: json })
		}
	}

	const selectFile = () => {
		openModal<BlobListResponseItem | null>({
			title: "Select a File",
			name: "aws-secure-file-selector",
			props: {
				selectedFile,
			},
			callback: (file: BlobListResponseItem | null | undefined) => {
				if (file) setSelectedFile(file)
			},
		})
	}

	useEffect(() => {

		//initialize the field value of the file
		if (fieldValue) {
			const file = JSON.parse(fieldValue) as BlobListResponseItem
			onsetSelectedFile(file)

			//if we have a file, we need to get the sas url

			fetch(`/api/get-secure-url?bucketName=${encodeURIComponent(bucketName)}&blobName=${encodeURIComponent(file.name)}&region=${encodeURIComponent(region)}&accessKeyId=${encodeURIComponent(accessKeyId)}`, {
				method: "GET",
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + secretAccessKey,
				}
			}).then(res => {
				if (res.ok) {
					return res.json()
				}
				throw new Error("Could not get SAS URL")
			}).then(data => {
				setSasUrl(data.url)
			}).catch(err => {
				console.error(err)
			})

		} else {
			onsetSelectedFile(null)
		}

	}, [fieldValue, bucketName, region, accessKeyId, secretAccessKey])


	const { loading, uploadProgress, uploadFile } = useUpload({
		accessKeyId,
		bucketName,
		region,
		secretAccessKey,
		onUpload: (file) => {
			setSelectedFile(file)
		}
	});

	const ext = (selectedFile?.name.split('.').pop() || "").toLowerCase()

	if (initializing) return null

	return (
		<div ref={containerRef} id="file-field" className="bg-white font-light text-sm relative">

			<DropZone readOnly={field?.readOnly}
				accessKeyId={accessKeyId}
				bucketName={bucketName}
				region={region}
				secretAccessKey={secretAccessKey}
				onUpload={(file) => {
					setSelectedFile(file)
				}}
			>
				<div className={classNames("transition-all", loading ? "blur-sm" : "blur-0")}>
					{
						selectedFile && (
							<div className="flex border border-gray-200 rounded gap-2 p-4">
								<div className="rounded-l shrink-0">
									<div className="flex items-center justify-center h-72 w-72 bg-gray-100">
										{ext === "pdf" ? (<IconFileTypePdf className="h-20 w-20 text-gray-600 stroke-[1.5px]" />) :
											(ext === "xls" || ext == "xlsx") ? (<IconFileTypeXls className="h-20 w-20 text-gray-600 stroke-[1.5px]" />) :
												(ext === "doc" || ext == "docx") ? (<IconFileTypeDocx className="h-20 w-20 text-gray-600 stroke-[1.5px]" />) :
													(ext === "mp4" || ext == "mov") ? (<IconVideo className="h-20 w-20 text-gray-600 stroke-[1.5px]" />) :
														(ext === "jpg" || ext == "jpeg" || ext == "png" || ext == "svg") ? (
															<>
																{/* show the image if we have one... */}
																{sasUrl ? (<img src={sasUrl} className="h-72 w-72 object-cover " alt={selectedFile.name} />) :
																	(<IconPhoto className="h-20 w-20 text-gray-600 stroke-[1.5px]" />)}
															</>
														) :
															(ext === "zip" || ext == "rar") ? (<IconFileZip className="h-20 w-20 text-gray-600 stroke-[1.5px]" />) :
																(<IconFile className="h-20 w-20 text-gray-600 stroke-[1.5px]" />)
										}
									</div>

								</div>
								<div className="flex-1 flex-col pl-2 space-y-2 ">
									<div className="flex gap-2 justify-between items-center">
										<div className="line-clamp-1 break-all text-sm " title={`Click to get a secure link to this file that will be valid for 10 minutes: ${selectedFile.name}`}>
											{sasUrl ? (<a href={sasUrl} target="_blank" referrerPolicy="no-referrer" className="text-purple-700 hover:underline">{selectedFile.name}</a>) : selectedFile.name}
										</div>
										<div>
											<ButtonDropDown
												button={{
													type: "alternative",
													size: "sm",
													label: "Browse",
													iconObj: <IconLayoutGrid className="text-gray-400 stroke-[1.5px] h-5 w-5" />,

													onClick: () => selectFile(),
												}}
												dropDown={{
													items: [
														[
															{
																label: "Upload",
																onClick: () => {
																	fileUploadRef.current?.click()
																},
															},
															{
																isEmphasized: true,
																label: "Remove",
																onClick: () => {
																	setSelectedFile(null)
																},
															},
														],
													],
													IconElement: () => <IconChevronDown />,
												}}
											/>

										</div>
									</div>

									<div className="">
										<TextInput
											type="text"
											placeholder="Label or Alt Text"
											value={selectedFile.label || ""}
											onChange={(str) => {
												selectedFile.label = str
												setSelectedFile({ ...selectedFile })
											}}
											className="text-xs" />
									</div>

									<div className=" flex justify-between py-2 mt-5 border-b border-b-gray-200 ">
										<div className="text-gray-500">Type</div>
										<div className="">{selectedFile.properties.contentType}</div>
									</div>
									<div className=" flex justify-between py-2 mt-5 border-b border-b-gray-200 ">
										<div className="text-gray-500">Size</div>
										<div className="">{formatBytes(selectedFile.properties.contentLength)}</div>
									</div>
									<div className=" flex justify-between py-2 mt-5 border-b border-b-gray-200 ">
										<div className="text-gray-500">Modified On</div>
										<div className="">{formatDateTime(selectedFile.properties.lastModified)}</div>
									</div>
								</div>
							</div>
						)
					}

					{
						!selectedFile && (
							<EmptySection
								icon={<IconFileUpload className="text-gray-400 h-12 w-12" stroke={1} />}
								messageHeading="No File Selected"
								messageBody="Select or drag and drop a file to attach it to this item."
								buttonComponent={<Button type="alternative" onClick={() => selectFile()} label="Browse Files" />}
							/>
						)
					}
				</div>
			</DropZone>

			{loading && <div className="absolute top-0 left-0 w-full h-full bg-white opacity-65 flex items-center justify-center">
				<div>Uploading - {uploadProgress}%...</div>
			</div>}

			<div className="h-1 w-1 overflow-hidden absolute -top-96 -left-96">
				<input type="file" ref={fileUploadRef} onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) {
						uploadFile(file);
					}
				}} />
			</div>
		</div >
	)
}
