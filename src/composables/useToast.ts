import { ref } from 'vue'
import { novoId } from '@/lib/id'

export type TipoToast = 'ok' | 'erro'

export interface Toast {
  id: string
  mensagem: string
  tipo: TipoToast
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function mostrar(mensagem: string, tipo: TipoToast = 'ok'): void {
    const id = novoId()
    toasts.value.push({ id, mensagem, tipo })
    setTimeout(() => dispensar(id), 3200)
  }

  function dispensar(id: string): void {
    const i = toasts.value.findIndex((t) => t.id === id)
    if (i >= 0) toasts.value.splice(i, 1)
  }

  return { toasts, mostrar, dispensar }
}
