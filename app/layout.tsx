import '#/styles/globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex h-screen items-center justify-center overflow-y-scroll bg-gray-1100 bg-[url('/grid.svg')]">
        {children}
      </body>
    </html>
  );
}
