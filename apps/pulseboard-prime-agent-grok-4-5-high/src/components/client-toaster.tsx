import { ClientOnly } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"

export function ClientToaster() {
  return (
    <ClientOnly fallback={null}>
      <Toaster theme="system" richColors closeButton position="top-center" />
    </ClientOnly>
  )
}
