import "./globals.css";

export const metadata = {
  title: "Fery",
  description: "Fery — turn a long link into a short one.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
