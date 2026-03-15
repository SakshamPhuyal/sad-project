import { QnAProvider } from "@/src/context/QnAContext"
import "./globals.css"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QnAProvider>
          {children}
        </QnAProvider>
      </body>
    </html>
  )
}