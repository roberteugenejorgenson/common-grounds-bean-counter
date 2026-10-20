import "./globals.css";

export const metadata = {
  title: "The Bean Counter",
  description: "Common Grounds Coffee — weekly numbers, one place",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
