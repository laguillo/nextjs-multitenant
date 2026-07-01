// Overrides the parent layout so the login page renders without the sidebar.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
