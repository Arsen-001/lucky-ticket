export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[100svh] max-h-[100svh]">ABCD : {children}</div>;
}
