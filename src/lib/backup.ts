import { SCHEMA_VERSION, type BackupPayload } from '@/types'

export function baixarBackup(payload: BackupPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `juju-backup-${payload.exportadoEm.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function ehLista(valor: unknown): boolean {
  return Array.isArray(valor)
}

export async function lerBackup(arquivo: File): Promise<BackupPayload> {
  let dados: unknown
  try {
    dados = JSON.parse(await arquivo.text())
  } catch {
    throw new Error('Arquivo não é um JSON válido.')
  }

  const payload = dados as Partial<BackupPayload>
  if (typeof payload?.schemaVersion !== 'number') {
    throw new Error('Arquivo não parece um backup do Juju na Aprovação.')
  }
  if (payload.schemaVersion > SCHEMA_VERSION) {
    throw new Error('Backup gerado por uma versão mais nova do site.')
  }
  if (!ehLista(payload.simulados) || !ehLista(payload.listas) || !payload.config) {
    throw new Error('Backup incompleto: faltam simulados, listas ou configurações.')
  }
  const config = payload.config
  if (!ehLista(config.areas) || !ehLista(config.bancas) || !ehLista(config.categorias)) {
    throw new Error('Backup incompleto: configurações corrompidas.')
  }

  return {
    schemaVersion: payload.schemaVersion,
    exportadoEm: payload.exportadoEm ?? new Date().toISOString(),
    config: {
      areas: config.areas,
      materias: config.materias ?? [],
      bancas: config.bancas,
      categorias: config.categorias,
      metas: config.metas ?? [],
      preferencias: config.preferencias ?? { ultimoBackupEm: null },
    },
    simulados: payload.simulados ?? [],
    listas: payload.listas ?? [],
  }
}
