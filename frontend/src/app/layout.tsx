import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../components/Providers";
import { AuthContextProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Symbiont",
  description: "Symbiont is a platform to help researchers and writers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ReactQueryProvider>
        <body className={plusJakartaSans.className}>
          <AuthContextProvider>{children}</AuthContextProvider>
        </body>
      </ReactQueryProvider>
    </html>
  );
}
