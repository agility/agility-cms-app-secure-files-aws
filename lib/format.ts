import numeral from "numeral"
import { DateTime, DateTimeFormatOptions } from "luxon"

const DateTimeFormats = {
	MIN_DATE: "0001-01-01T00:00:00",
	SERVER_FORMAT: "yyyy-MM-dd'T'HH:mm:ss.S",
	CONTENTITEM_FORMAT: "yyyy-MM-dd'T'HH:mm:ss",
	DATE_ONLY_FORMAT: "yyyy-MM-dd",
	DATE_AND_TIME_FORMAT: "yyyy-MM-dd'T'HH:mm",
	UTC_FORMAT: "yyyy-MM-dd'T'HH:mm:ss.u'Z'"
}



/**
 * The default timezone that Agility uses for storing datetime values.
 */
export const DEFAULT_TIMEZONE = "America/New_York"

/**
 *
 * Format bytes into easy to read sizes
 * @param bytes<Number> - Bytes to format
 * @param decimals<Number> - Decimal places
 * @returns number
 *
 */
export function formatBytes(bytes: number) {
	return numeral(bytes).format("0b")
	// if (bytes === 0) return '0 Bytes';

	// const k = 1024;
	// const dm = decimals < 0 ? 0 : decimals;
	// const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	// const i = Math.floor(Math.log(bytes) / Math.log(k));

	// return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a regular number using the numeral library
 * @param num a number to format
 * @param format a numeral format string (see https://numeraljs.com/) defaults to "0a"
 * @returns
 */
export function formatNumeral(num: number, format?: string) {
	if (!format) format = "0a"
	return numeral(num).format(format)
}

/**
 * If a number is less than 10, output it direction, otherwise output 9+
 * @param num A number to format
 */
export function formatNumberUpToNine(num: number) {
	if (num < 10) return num.toString()
	return "9+"
}

/**
 *
 * Format numbers to human readable abbr. i.e 1000 = 1k
 * @param num<Number> - number to format
 * @param decimals<Number> - Decimal places
 * @returns number
 *
 */

export function formatNumber(num: any, decimals: number) {
	const lookup = [
		{ value: 1, symbol: "" },
		{ value: 1e3, symbol: "k" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e9, symbol: "G" },
		{ value: 1e12, symbol: "T" },
		{ value: 1e15, symbol: "P" },
		{ value: 1e18, symbol: "E" }
	]
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
	var item = lookup
		.slice()
		.reverse()
		.find(function (item) {
			return num >= item.value
		})
	return item ? (num / item.value).toFixed(decimals).replace(rx, "$1") + item.symbol : "0"
}


export function formatDateTime(date: string) {
	const jsd = new Date(date)
	const dt = DateTime.fromJSDate(jsd)
	return dt.toLocaleString(DateTime.DATETIME_MED)

}


/**
 *
 * Name format for endpoint submission (e.g rename folder)
 * @param date<string> - name
 * @returns string
 *
 */
export function removeSpecialCharacters(name: string) {
	const r = new RegExp("[^0-9,a-z,A-Z]", "g")
	return name.toLowerCase().replace(r, "-")
}

export function removeSpecialCharactersForReferenceName(name: string) {
	const r = new RegExp("[^0-9,a-z,A-Z]", "g")
	return name.replace(r, "")
}

/**
 * Should remove all special characters EXCEPT underscores
 * @param name
 * @returns
 */
export function removeSpecialCharactersForFieldName(name: string) {
	const r = new RegExp("[^0-9,a-z,A-Z_]", "g")
	return name.replace(r, "")
}

export function removeFileExtension(name: string) {
	return name?.substring(0, name.lastIndexOf("."))
}

export function formatDataType(name: string) {
	return name?.substring(0, name.lastIndexOf("/"))
}

/**
 * When uploading images and folders on the assets page we require a parent key of where the item belongs to.
 * This util helps you with that by extracting the parent key from the origingKey property
 * @param prefix - string from originkey
 * @returns string
 *
 * @internal
 */
export const getParentKey = (prefix: string) => {
	if (!prefix) return null
	let parentKeyArray = [...prefix.split("/")]
	parentKeyArray.splice(parentKeyArray.length - 1, 2)
	return parentKeyArray.length >= 1 ? `${parentKeyArray.join("/")}/` : ""
}
