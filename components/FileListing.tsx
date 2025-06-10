/* eslint-disable @next/next/no-img-element */
import { TextInputAddon, Button } from "@agility/plenum-ui"
import { useCallback, useEffect, useMemo, useState } from "react"
import { debounce } from "underscore"
import Loader from "./Loader"
import FileRow from "./FileRow"
import DirectoryRow from "./DirectoryRow"
import Breadcrumbs from "./Breadcrumbs"

import { DropZone } from "./DropZone"
import InfiniteScroll from "react-infinite-scroll-component"
import { getFileListing } from "@/lib/get-file-listing"
import { BlobItem, FileItem, DirectoryItem } from "@/types/BlobListResponseItem"
import { FileListingProps } from "@/types/ComponentProps"
import { IconFolder, IconFolderPlus, IconX } from "@tabler/icons-react"

export default function FileListing({ 
	accessKeyId, 
	bucketName, 
	region, 
	secretAccessKey, 
	onSelect,
	onSelectDirectory
}: FileListingProps) {

	const [cursor, setCursor] = useState<string>("")
	const [filter, setFilter] = useState("")
	const [filterValueBounced, setfilterValueBounced] = useState<string>("")
	const [currentPath, setCurrentPath] = useState<string>("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<any>(null)
	const [data, setData] = useState<BlobItem[]>([])
	const [showCreateFolder, setShowCreateFolder] = useState(false)
	const [newFolderName, setNewFolderName] = useState("")
	const [creatingFolder, setCreatingFolder] = useState(false)

	const setfilterValueAndDebounce = (val: string) => {
		setFilter(val)
		debouncefilterValue(val)
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncefilterValue = useCallback(
		//handle the search change - use debounce to limit how many times per second this is called
		debounce((value: string) => {
			//clear out the pagination cursor
			setCursor("")

			//set the filter
			setfilterValueBounced(value.trim())
		}, 250),
		[]
	)

	const hasMore = useMemo(() => cursor !== "", [cursor])

	const navigateToDirectory = (path: string) => {
		// If we're already at the target path, don't reload
		if (currentPath === path) return
		
		setCurrentPath(path)
		setCursor("")
		setData([])
		setfilterValueBounced("")
		setFilter("")
	}



	const loadNext = useCallback(() => {
		if (loading) return
		if (error) return

		getFileListing({ accessKeyId, bucketName, region, secretAccessKey, search: filterValueBounced, cursor, currentPath })
			.then((res) => {
				setCursor(res.cursor)
				setData((prev) => [...prev, ...res.items])
			}).catch((err) => {
				setError(err)
			}).finally(() => {
				setLoading(false)
			})

	}, [accessKeyId, bucketName, cursor, filterValueBounced, region, secretAccessKey, currentPath])

	useEffect(() => {
		//load the first page of files, or when the filter changes or path changes
		setLoading(true)
		setError(null)
		setCursor("")
		setData([])
		loadNext()
	}, [filterValueBounced, currentPath])

	// Separate files and directories for display
	const directories = data.filter((item): item is DirectoryItem => item.type === 'directory')
	const files = data.filter((item): item is FileItem => item.type === 'file')

	const createFolder = async () => {
		if (!newFolderName.trim()) return
		
		setCreatingFolder(true)
		try {
			const directoryPath = currentPath ? `${currentPath}${newFolderName}` : newFolderName
			
			const response = await fetch('/api/create-directory', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${secretAccessKey}`
				},
				body: JSON.stringify({
					bucketName,
					directoryPath,
					region,
					accessKeyId
				})
			})

			if (!response.ok) {
				throw new Error('Failed to create folder')
			}

			// Reset modal state
			setShowCreateFolder(false)
			setNewFolderName("")
			
			// Refresh the file listing
			setLoading(true)
			setError(null)
			setCursor("")
			setData([])
			loadNext()
		} catch (err) {
			console.error('Error creating folder:', err)
			setError(err)
		} finally {
			setCreatingFolder(false)
		}
	}

	return (
		<DropZone className="flex flex-col h-full"
			readOnly={false}
			accessKeyId={accessKeyId}
			bucketName={bucketName}
			region={region}
			secretAccessKey={secretAccessKey}
			onUpload={onSelect}
			currentPath={currentPath}>

			<Breadcrumbs 
				currentPath={currentPath} 
				onNavigate={navigateToDirectory}
			/>



			<div className="flex items-center gap-2 mr-2">
				<div className="p-1 flex-1">
					<TextInputAddon
						placeholder="Starts with..."
						isFocused
						type="search"
						value={filter}
						onChange={(str) => setfilterValueAndDebounce(str.trim())}
					/>
				</div>
				
				<Button
					type="alternative"
					size="sm"
					label="Create Folder"
					iconObj={<IconFolderPlus className="h-4 w-4" />}
					onClick={() => setShowCreateFolder(true)}
				/>
			</div>
			{loading && (
				<div className="flex flex-col flex-1 h-full justify-center items-center min-h-0">
					<div className="flex gap-2 items-center text-gray-500">
						<Loader className="!h-6 !w-6 " />
						<div>Loading...</div>
					</div>
				</div>
			)}
			{error && <div>Error? {`${error}`}</div>}
			{!loading && !error && data.length == 0 && (
				<div className="p-3 text-sm">No files returned. Drag a file here to upload it.</div>
			)}
			{!loading && !error && (
				<div className="min-h-0 flex-1 py-4">
					<div id="scrolling-list-elem" className="scroll-black h-full overflow-y-auto">
						<div className="space-y-1 p-2">
							{/* Directories Section */}
							{directories.length > 0 && (
								<div className="space-y-1">
									{directories.map((directory) => (
										<DirectoryRow
											key={directory.fullPath}
											item={directory}
											onNavigate={navigateToDirectory}
											onSelectDirectory={onSelectDirectory}
										/>
									))}
								</div>
							)}

							{/* Separator between directories and files */}
							{directories.length > 0 && files.length > 0 && (
								<div className="border-t border-gray-200 my-2"></div>
							)}

							{/* Files Section */}
							<InfiniteScroll
								scrollableTarget="scrolling-list-elem"
								dataLength={files.length}
								next={() => loadNext()}
								hasMore={hasMore}
								loader={<div className="text-center py-2 text-gray-500">Loading more files...</div>}
							>
								<div className="space-y-1">
									{files.map((file) => (
										<FileRow
											key={file.properties.etag}
											item={file}
											onSelect={onSelect}
										/>
									))}
								</div>
							</InfiniteScroll>

							{/* Empty state */}
							{data.length === 0 && (
								<div className="p-8 text-center text-gray-500">
									<IconFolder className="h-12 w-12 mx-auto mb-2 text-gray-400" />
									<p>No files or directories found</p>
									<p className="text-xs mt-1">Drag a file here to upload it</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Create Folder Modal */}
			{showCreateFolder && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-medium text-gray-900">Create New Folder</h3>
							<button
								onClick={() => {
									setShowCreateFolder(false)
									setNewFolderName("")
								}}
								className="text-gray-400 hover:text-gray-500"
							>
								<IconX className="h-5 w-5" />
							</button>
						</div>
						
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Folder Name
							</label>
							<TextInputAddon
								type="text"
								placeholder="Enter folder name..."
								value={newFolderName}
								onChange={setNewFolderName}
								isFocused
							/>
							{currentPath && (
								<p className="text-xs text-gray-500 mt-1">
									Will be created in: {currentPath}
								</p>
							)}
						</div>
						
						<div className="flex justify-end space-x-3">
							<Button
								type="alternative"
								label="Cancel"
								onClick={() => {
									setShowCreateFolder(false)
									setNewFolderName("")
								}}
								isDisabled={creatingFolder}
							/>
							<Button
								type="primary"
								label={creatingFolder ? "Creating..." : "Create Folder"}
								onClick={createFolder}
								isDisabled={!newFolderName.trim() || creatingFolder}
								iconObj={creatingFolder ? <Loader className="h-4 w-4" /> : <IconFolderPlus className="h-4 w-4" />}
							/>
						</div>
					</div>
				</div>
			)}

		</DropZone>
	)
}
