export const metadata = {
  title: 'ququ portal',
  description: 'Тест тапсыру және билеттер порталы',
};

export default function RootLayout({ children }) {
  return (
    <html lang="kk">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  );
}
