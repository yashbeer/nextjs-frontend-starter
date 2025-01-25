import "./globals.css";
import { UserProvider } from "@/context/user-context";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Nextjs App</title>
        <meta name="description" content="Make app" />
      </head>
      <body>
        <UserProvider>{children}</UserProvider>
        <Toaster 
        position="top-center" 
        richColors 
        expand={true}
        closeButton={true}
      />
      </body>
    </html>
  );
}
