import "./globals.css";
export const metadata = { title: "NiteChop — never sleeps, always delivers" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
