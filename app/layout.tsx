import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UDSM Information Dissemination Platform API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
