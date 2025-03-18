/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: 'frame-src app-qa.publishwithagility.com app.agilitycms.com',
					},
				],
			},

		]
	}
}

module.exports = nextConfig
