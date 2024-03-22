import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../components/Providers";
import { AuthContextProvider } from "./context/AuthContext";
import { StudyProvider } from "./context/StudyContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
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
      {/* ? shouldn't the reactqueryprovider be below the body tag ? */}
      <ReactQueryProvider>
        <body className={plusJakartaSans.className}>
          <AuthContextProvider>
            <StudyProvider>
              <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
            </StudyProvider>
          </AuthContextProvider>
        </body>
      </ReactQueryProvider>
    </html>
  );
}
