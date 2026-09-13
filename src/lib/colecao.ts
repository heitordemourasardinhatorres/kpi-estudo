import { ref, type Ref } from 'vue'
import { novoId } from '@/lib/id'
import type { Duvida, ID, RegistroErro } from '@/types'

export function upsert<T extends { id: ID }>(lista: T[], item: T): void {
  const i = lista.findIndex((x) => x.id === item.id)
  if (i >= 0) lista[i] = item
  else lista.push(item)
}

export function removerPorId<T extends { id: ID }>(lista: T[], id: ID): void {
  const i = lista.findIndex((x) => x.id === id)
  if (i >= 0) lista.splice(i, 1)
}

interface ComFilhos {
  id: ID
  erros: RegistroErro[]
  duvidas: Duvida[]
}

/**
 * Simulados e listas compartilham o mesmo ciclo de vida (CRUD + erros + dúvidas
 * embutidos), então as duas stores são montadas a partir daqui.
 */
export function criarColecao<T extends ComFilhos>() {
  const itens = ref<T[]>([]) as Ref<T[]>

  const porId = (id: ID): T | undefined => itens.value.find((x) => x.id === id)

  function salvar(item: T): T {
    const completo = item.id ? item : { ...item, id: novoId() }
    upsert(itens.value, completo)
    return completo
  }

  function remover(id: ID): void {
    removerPorId(itens.value, id)
  }

  function adicionarErro(registroId: ID, erro: Omit<RegistroErro, 'id'>): void {
    porId(registroId)?.erros.push({ ...erro, id: novoId() })
  }

  function atualizarErro(registroId: ID, erro: RegistroErro): void {
    const alvo = porId(registroId)
    if (alvo) upsert(alvo.erros, erro)
  }

  function removerErro(registroId: ID, erroId: ID): void {
    const alvo = porId(registroId)
    if (alvo) removerPorId(alvo.erros, erroId)
  }

  /** Lançamento rápido: soma na linha sem questão da categoria, criando se preciso. */
  function ajustarErroRapido(registroId: ID, categoriaId: ID, delta: number): void {
    const alvo = porId(registroId)
    if (!alvo) return
    const linha = alvo.erros.find((e) => e.categoriaId === categoriaId && !e.questao && !e.materiaId)
    if (!linha) {
      if (delta > 0) alvo.erros.push({ id: novoId(), categoriaId, quantidade: delta })
      return
    }
    linha.quantidade += delta
    if (linha.quantidade <= 0) removerPorId(alvo.erros, linha.id)
  }

  function adicionarDuvida(registroId: ID, duvida: Omit<Duvida, 'id' | 'criadaEm' | 'resolvida'>): void {
    porId(registroId)?.duvidas.push({
      ...duvida,
      id: novoId(),
      resolvida: false,
      criadaEm: new Date().toISOString(),
    })
  }

  function alternarDuvida(registroId: ID, duvidaId: ID): void {
    const duvida = porId(registroId)?.duvidas.find((d) => d.id === duvidaId)
    if (!duvida) return
    duvida.resolvida = !duvida.resolvida
    duvida.resolvidaEm = duvida.resolvida ? new Date().toISOString() : undefined
  }

  function removerDuvida(registroId: ID, duvidaId: ID): void {
    const alvo = porId(registroId)
    if (alvo) removerPorId(alvo.duvidas, duvidaId)
  }

  function substituir(novos: T[]): void {
    itens.value = novos
  }

  return {
    itens,
    porId,
    salvar,
    remover,
    adicionarErro,
    atualizarErro,
    removerErro,
    ajustarErroRapido,
    adicionarDuvida,
    alternarDuvida,
    removerDuvida,
    substituir,
  }
}
