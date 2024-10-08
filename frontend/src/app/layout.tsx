"use client";
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
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";

import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const raleway = Raleway({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: "400" });
const lato = Lato({ subsets: ["latin"], weight: "400" });
const open_sans = Open_Sans({ subsets: ["latin"], weight: "400" });

// export const metadata: Metadata = {
//   title: "Symbiont",
//   description: "Symbiont is a platform to help researchers and writers",
// };

if (typeof window !== "undefined") {
  const apiDomain = process.env.NEXT_PUBLIC_SUPERTOKENS_API_ENDPOINT;

  if (!apiDomain) {
    console.error(
      "Environment variable NEXT_PUBLIC_SUPERTOKENS_WEBSITE_DOMAIN is not defined"
    );
    console.log(apiDomain);
  } else {
    SuperTokens.init({
      appInfo: {
        appName: "symbiont",
        apiDomain: apiDomain,
        websiteDomain:
          window.location.origin ||
          process.env.NEXT_PUBLIC_SUPERTOKENS_WEBSITE_DOMAIN ||
          "",
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
      },
      recipeList: [EmailPassword.init(), Session.init()],
    });
  }
}
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
          <SuperTokensWrapper>
            <AuthContextProvider>
              <StudyProvider>
                <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
              </StudyProvider>
            </AuthContextProvider>
          </SuperTokensWrapper>
        </body>
      </ReactQueryProvider>
    </html>
  );
}
