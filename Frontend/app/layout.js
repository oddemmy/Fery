import "./globals.css";

export const metadata = {
  title: "Ferry",
  description: "Ferry — turn a long link into a short one.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
