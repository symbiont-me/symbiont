import type { Metadata } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
  Raleway,
  Montserrat,
  Roboto,
  Lato,
  Open_Sans,
} from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../components/Providers";
import { AuthContextProvider } from "./context/AuthContext";
import { StudyProvider } from "./context/StudyContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const raleway = Raleway({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: "400" });
const lato = Lato({ subsets: ["latin"], weight: "400" });
const open_sans = Open_Sans({ subsets: ["latin"], weight: "400" });
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
        <body className={lato.className}>
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
