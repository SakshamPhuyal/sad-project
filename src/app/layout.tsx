import { QnAProvider } from "@/src/context/QnAContext";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QnAProvider>
          <ToastContainer position="top-right" autoClose={2500} />
          {children}
        </QnAProvider>
      </body>
    </html>
  );
}
