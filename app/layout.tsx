import './globals.css'

export const metadata = {
	title: 'Lumina',
	description: 'Lumina Next app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body style={{ background: '#000' }}>{children}</body>
		</html>
	)
}