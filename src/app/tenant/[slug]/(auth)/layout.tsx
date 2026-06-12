// Override del layout padre ([tenant]/layout.tsx) para la página de login.
// No incluye TenantNavbar — el login es una pantalla limpia sin navegación.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
