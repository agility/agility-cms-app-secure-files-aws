import { BlobListResponseItem } from "@/app/api/get-files/route"
import { IconFileTypePdf, IconFileTypeXls, IconFileTypeDocx, IconVideo, IconFileZip, IconFile, IconPhoto } from "@tabler/icons-react"

interface Props {
	file: BlobListResponseItem
	size: "sm" | "lg"
}

export const FileIcon = ({ file, size }: Props) => {

	const ext = (file?.name.split('.').pop() || "").toLowerCase()
	let className = "h-20 w-20 text-gray-600 stroke-[1.5px]"
	if (size === "sm") {
		className = "h-10 w-10 text-gray-600 stroke-[1.5px]"
	}


	return (<>{ext === "pdf" ? (<IconFileTypePdf className={className} />) :
		(ext === "xls" || ext == "xlsx") ? (<IconFileTypeXls className={className} />) :
			(ext === "doc" || ext == "docx") ? (<IconFileTypeDocx className={className} />) :
				(ext === "mp4" || ext == "mov") ? (<IconVideo className={className} />) :
					(ext === "jpg" || ext == "jpeg" || ext == "png" || ext == "svg") ? (<IconPhoto className={className} />) :
						(ext === "zip" || ext == "rar") ? (<IconFileZip className={className} />) :
							(<IconFile className={className} />)
	}</>)
}