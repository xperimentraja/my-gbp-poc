export const metadata = {
  title: "Google Business Profile POC",
  description: "A simple UI for managing GBP data.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}