import "./globals.css";

export const metadata = {
  title: "Todo with Google Auth",
  description: "Simple todo app with Next.js + Express + Google OAuth",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
