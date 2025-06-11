/* eslint-disable @next/next/no-img-element */
"use client"

import EmptySection from "@/components/EmptySection"

import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from "@agility/app-sdk"
import { Button, ButtonDropDown, TextInput } from "@agility/plenum-ui"
import { IconFileTypeDocx, IconFileTypePdf, IconFileTypeXls, IconFileUpload, IconFileZip, IconImageInPicture, IconLayoutGrid, IconPhoto, IconVideo, IconFolder } from "@tabler/icons-react"
import { IconChevronDown, IconFile } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { formatBytes, formatDateTime } from "@/lib/format"
import { DropZone } from "@/components/DropZone"
import { useUpload } from "@/hooks/useUpload"
import classNames from "classnames"
import { BlobListResponseItem, FileItem, DirectoryItem, FieldValue } from "@/types/BlobListResponseItem"

export default function Field() {
	const { initializing, appInstallContext, field, fieldValue } = useAgilityAppSDK()

	const fileUploadRef = useRef<HTMLInputElement>(null);
	const containerRef = useResizeHeight()

	const bucketName = appInstallContext?.configuration?.bucketName || ""
	const accessKeyId = appInstallContext?.configuration?.AWS_ACCESS_KEY_ID || ""
	const secretAccessKey = appInstallContext?.configuration?.AWS_SECRET_ACCESS_KEY || ""
	const region = appInstallContext?.configuration?.AWS_REGION || ""

	const [selectedItem, setSelectedItem] = useState<FieldValue | null>(null)
	const [sasUrl, setSasUrl] = useState<string | null>(null)

	const setSelectedValue = (item: FieldValue | null) => {
		setSelectedItem(item)
		if (!item) {
			contentItemMethods.setFieldValue({ name: field?.name, value: "" })
		} else {
			const json = JSON.stringify(item)
			contentItemMethods.setFieldValue({ name: field?.name, value: json })
		}
	}

	const selectFileOrDirectory = () => {
		openModal<FieldValue | null>({
			title: "Select a File or Directory", 
			name: "aws-secure-file-selector",
			props: {
				allowDirectorySelection: true,
			},
			callback: (result: FieldValue | null | undefined) => {
				if (result) {
					setSelectedValue(result)
				}
			},
		})
	}

	const handleFileUpload = (fileItem: FileItem) => {
		setSelectedValue(fileItem)
	}

	useEffect(() => {
		//initialize the field value
		if (fieldValue) {
			try {
				const parsed = JSON.parse(fieldValue)
				
				// Handle backward compatibility with old file format
				if (parsed.properties && !parsed.type) {
					// Old format - convert to new FileItem format
					const fileItem: FileItem = {
						...parsed,
						type: 'file'
					}
					setSelectedItem(fileItem)
				} else if (parsed.type) {
					// New format - use as is
					setSelectedItem(parsed as FieldValue)
				}
			} catch (err) {
				console.error("Error parsing field value:", err)
				setSelectedItem(null)
			}

			// Generate secure URL only for files
			if (selectedItem?.type === 'file') {
				fetch(`/api/get-secure-url?bucketName=${encodeURIComponent(bucketName)}&blobName=${encodeURIComponent(selectedItem.name)}&region=${encodeURIComponent(region)}&accessKeyId=${encodeURIComponent(accessKeyId)}`, {
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
				setSasUrl(null)
			}

		} else {
			setSelectedItem(null)
		}

	}, [fieldValue, bucketName, region, accessKeyId, secretAccessKey, selectedItem?.type, selectedItem?.name])

	const { loading, uploadProgress, uploadFile } = useUpload({
		accessKeyId,
		bucketName,
		region,
		secretAccessKey,
		onUpload: handleFileUpload
	});

	useEffect(()=> {
		console.log('Initializing', initializing)
	},[initializing])

	if (initializing) return null

	return (
		<div ref={containerRef} id="file-field" className="bg-white font-light text-sm relative">

			<DropZone readOnly={field?.readOnly}
				accessKeyId={accessKeyId}
				bucketName={bucketName}
				region={region}
				secretAccessKey={secretAccessKey}
				onUpload={handleFileUpload}
			>
				<div className={classNames("transition-all", loading ? "blur-sm" : "blur-0")}>
					{
						selectedItem && selectedItem.type === 'file' && (
							<div className="flex border border-gray-200 rounded gap-2 p-4">
								<div className="rounded-l shrink-0">
									<div className="flex items-center justify-center h-72 w-72 bg-gray-100">
										{(() => {
											const displayName = selectedItem.displayName || selectedItem.name
											const ext = (displayName.split('.').pop() || "").toLowerCase()
											if (ext === "pdf") return <IconFileTypePdf className="h-20 w-20 text-gray-600 stroke-[1.5px]" />
											if (ext === "xls" || ext === "xlsx") return <IconFileTypeXls className="h-20 w-20 text-gray-600 stroke-[1.5px]" />
											if (ext === "doc" || ext === "docx") return <IconFileTypeDocx className="h-20 w-20 text-gray-600 stroke-[1.5px]" />
											if (ext === "mp4" || ext === "mov") return <IconVideo className="h-20 w-20 text-gray-600 stroke-[1.5px]" />
											if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "svg") {
												return sasUrl ? (
													<img src={sasUrl} className="h-72 w-72 object-cover" alt={displayName} />
												) : (
													<IconPhoto className="h-20 w-20 text-gray-600 stroke-[1.5px]" />
												)
											}
											if (ext === "zip" || ext === "rar") return <IconFileZip className="h-20 w-20 text-gray-600 stroke-[1.5px]" />
											return <IconFile className="h-20 w-20 text-gray-600 stroke-[1.5px]" />
										})()}
									</div>
								</div>
								<div className="flex-1 flex-col pl-2 space-y-2">
									<div className="flex gap-2 justify-between items-center">
										<div className="line-clamp-1 break-all text-sm" title={`Click to get a secure link to this file that will be valid for 10 minutes: ${selectedItem.displayName || selectedItem.name}`}>
											{sasUrl ? (
												<a href={sasUrl} target="_blank" rel="noreferrer" className="text-purple-700 hover:underline">
													{selectedItem.displayName || selectedItem.name}
												</a>
											) : selectedItem.displayName || selectedItem.name}
										</div>
										<div>
											<ButtonDropDown
												button={{
													type: "alternative",
													size: "sm",
													label: "Browse",
													iconObj: <IconLayoutGrid className="text-gray-400 stroke-[1.5px] h-5 w-5" />,
													onClick: () => selectFileOrDirectory(),
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
																	setSelectedValue(null)
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
											value={selectedItem.label || ""}
											onChange={(str) => {
												const updatedItem = { ...selectedItem, label: str }
												setSelectedValue(updatedItem)
											}}
											className="text-xs" />
									</div>
									<div className="flex justify-between py-2 mt-5 border-b border-b-gray-200">
										<div className="text-gray-500">Directory</div>
										<div className="font-mono text-xs">{(() => {
											const pathParts = selectedItem.name.split('/')
											pathParts.pop() // Remove filename
											const dirPath = pathParts.join('/')
											return dirPath || '/'
										})()}</div>
									</div>
									{selectedItem.properties.contentType && (
										<div className="flex justify-between py-2 mt-5 border-b border-b-gray-200">
											<div className="text-gray-500">Type</div>
											<div className="">{selectedItem.properties.contentType}</div>
										</div>
									)}
									<div className="flex justify-between py-2 mt-5 border-b border-b-gray-200">
										<div className="text-gray-500">Size</div>
										<div className="">{formatBytes(selectedItem.properties.contentLength)}</div>
									</div>
									<div className="flex justify-between py-2 mt-5 border-b border-b-gray-200">
										<div className="text-gray-500">Modified On</div>
										<div className="">{formatDateTime(selectedItem.properties.lastModified)}</div>
									</div>
								</div>
							</div>
						)
					}

					{
						selectedItem && selectedItem.type === 'directory' && (
							<div className="flex border border-blue-200 rounded gap-2 p-4 bg-blue-50">
								<div className="rounded-l shrink-0">
									<div className="flex items-center justify-center h-72 w-72 bg-blue-100">
										<IconFolder className="h-20 w-20 text-blue-600 stroke-[1.5px]" />
									</div>
								</div>
								<div className="flex-1 flex-col pl-2 space-y-2">
									<div className="flex gap-2 justify-between items-center">
										<div className="line-clamp-1 break-all text-sm font-medium text-blue-900">
											Directory: {selectedItem.name}
										</div>
										<div>
											<ButtonDropDown
												button={{
													type: "alternative",
													size: "sm",
													label: "Browse",
													iconObj: <IconLayoutGrid className="text-gray-400 stroke-[1.5px] h-5 w-5" />,
													onClick: () => selectFileOrDirectory(),
												}}
												dropDown={{
													items: [
														[
															{
																isEmphasized: true,
																label: "Remove",
																onClick: () => {
																	setSelectedValue(null)
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
											placeholder="Label or Description"
											value={selectedItem.label || ""}
											onChange={(str) => {
												const updatedItem = { ...selectedItem, label: str }
												setSelectedValue(updatedItem)
											}}
											className="text-xs" />
									</div>
									
									<div className="flex justify-between py-2 mt-5 border-b border-b-blue-200">
										<div className="text-blue-700">Directory Path</div>
										<div className="text-blue-900 font-mono text-xs">{selectedItem.fullPath || "/"}</div>
									</div>
									
									{selectedItem.metadata?.fileCount !== undefined && (
										<div className="flex justify-between py-2 mt-5 border-b border-b-blue-200">
											<div className="text-blue-700">File Count</div>
											<div className="text-blue-900">{selectedItem.metadata.fileCount}</div>
										</div>
									)}
									
									{selectedItem.metadata?.totalSize !== undefined && (
										<div className="flex justify-between py-2 mt-5 border-b border-b-blue-200">
											<div className="text-blue-700">Total Size</div>
											<div className="text-blue-900">{formatBytes(selectedItem.metadata.totalSize)}</div>
										</div>
									)}
									
									{selectedItem.metadata?.lastModified && (
										<div className="flex justify-between py-2 mt-5 border-b border-b-blue-200">
											<div className="text-blue-700">Last Modified</div>
											<div className="text-blue-900">{formatDateTime(selectedItem.metadata.lastModified)}</div>
										</div>
									)}
								</div>
							</div>
						)
					}

					{
						!selectedItem && (
							<EmptySection
								icon={<IconFileUpload className="text-gray-400 h-12 w-12" stroke={1} />}
								messageHeading="No File or Directory Selected"
								messageBody="Select or drag and drop a file, or browse to select a directory."
								buttonComponent={<Button type="alternative" onClick={() => selectFileOrDirectory()} label="Browse Files & Directories" />}
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
