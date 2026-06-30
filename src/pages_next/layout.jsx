import "./globals.css";
import { Providers } from "./providers";
import ConditionalLayout from "../components/ConditionalLayout";

export const metadata = {
  title: "Vegpik - Fresh Vegetables & Groceries Delivered",
  description: "Get fresh organic vegetables and daily essentials delivered right to your doorstep from Vegpik.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
