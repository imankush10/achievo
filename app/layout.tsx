import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PlaylistPro - YouTube Playlist Manager',
  description: 'Track your progress through YouTube playlists with style',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scrollbar-thin">
      <body className={`${inter.className} bg-neutral-900 min-h-screen transition-all duration-300`}>
        <ToastProvider>
          {/* Subtle background gradient for glassmorphism effect */}
          <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800/40 to-neutral-900 pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
