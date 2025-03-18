import React from "react";
import { Button, ButtonDropDown } from "@agility/plenum-ui";
import { IconChevronDown } from "@tabler/icons-react";

interface FieldHeaderProps {
	fieldConfig: any;
	attachment: any;
	handleRemove: any;
	handleSelect: any;
}

const FieldHeader = ({
	fieldConfig,
	attachment,
	handleRemove,
	handleSelect,
}: FieldHeaderProps) => {
	return (
		<div className='flex w-full items-center justify-between pb-1 font-muli'>
			<div className='flex items-center' />
			{fieldConfig.readOnly !== true && (
				<div className='top-buttons'>
					{attachment ? (
						<ButtonDropDown
							button={{
								icon: "CollectionIcon",
								label: "Browse",
								size: "sm",
								onClick: () => handleSelect(),
								type: "secondary",
							}}
							dropDown={{
								IconElement: () => (
									<IconChevronDown
										className='h-5 w-5 text-purple-600'
									/>
								),
								items: [
									[
										{
											icon: "TrashIcon",
											label: "Remove",
											isEmphasized: true,
											onClick: () => handleRemove(),
										},
									],
								],
							}}
						/>
					) : (
						<Button
							icon='FolderDownloadIcon'
							label='Browse'
							size='sm'
							onClick={() => handleSelect()}
							type='secondary'
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default FieldHeader;
