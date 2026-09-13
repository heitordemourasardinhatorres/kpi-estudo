<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useToast } from '@/composables/useToast'
import { baixarBackup, lerBackup } from '@/lib/backup'
import { diasDesde } from '@/lib/date'
import { gerarDadosExemplo } from '@/lib/demo'
import { useConfigStore } from '@/stores/config'
import { useListasStore } from '@/stores/listas'
import { useSimuladosStore } from '@/stores/simulados'
import { SCHEMA_VERSION, type BackupPayload } from '@/types'

const config = useConfigStore()
const simulados = useSimuladosStore()
const listas = useListasStore()
const { mostrar } = useToast()

const arquivo = ref<HTMLInputElement>()

const dias = computed(() => diasDesde(config.preferencias.ultimoBackupEm))
const atrasado = computed(() => dias.value === null || dias.value > 14)

function exportar(): void {
  const payload: BackupPayload = {
    schemaVersion: SCHEMA_VERSION,
    exportadoEm: new Date().toISOString(),
    config: {
      areas: config.areas,
      materias: config.materias,
      bancas: config.bancas,
      categorias: config.categorias,
      metas: config.metas,
      preferencias: config.preferencias,
    },
    simulados: simulados.itens,
    listas: listas.itens,
  }
  baixarBackup(payload)
  config.registrarBackup()
  mostrar('Backup baixado')
}

async function importar(evento: Event): Promise<void> {
  const input = evento.target as HTMLInputElement
  const selecionado = input.files?.[0]
  if (!selecionado) return

  try {
    const payload = await lerBackup(selecionado)
    const resumo = `Importar ${payload.simulados.length} simulado(s) e ${payload.listas.length} lista(s)? Tudo que está no site agora será substituído.`
    if (confirm(resumo)) {
      config.substituir(payload.config)
      simulados.substituir(payload.simulados)
      listas.substituir(payload.listas)
      mostrar('Backup restaurado')
    }
  } catch (erro) {
    mostrar(erro instanceof Error ? erro.message : 'Não consegui ler o arquivo.', 'erro')
  } finally {
    input.value = ''
  }
}

function carregarExemplo(): void {
  if (simulados.itens.length || listas.itens.length) {
    if (!confirm('Isso substitui os simulados e listas que já existem. Continuar?')) return
  }
  const exemplo = gerarDadosExemplo()
  config.restaurarPadroes()
  exemplo.metas.forEach(config.salvarMeta)
  simulados.substituir(exemplo.simulados)
  listas.substituir(exemplo.listas)
  mostrar('Dados de exemplo carregados')
}

function apagarTudo(): void {
  if (!confirm('Apagar TODOS os simulados, listas, erros e dúvidas? Não dá para desfazer.')) return
  if (!confirm('Tem certeza mesmo? Exporte um backup antes se tiver dúvida.')) return
  simulados.substituir([])
  listas.substituir([])
  mostrar('Tudo apagado')
}
</script>

<template>
  <div class="backup">
    <div class="aviso" :class="{ atrasado }">
      <BaseIcon :nome="atrasado ? 'alerta' : 'check'" :tamanho="18" />
      <p v-if="dias === null">
        Você nunca exportou um backup. Os dados vivem só neste navegador — limpar o histórico apaga
        tudo.
      </p>
      <p v-else-if="atrasado">Último backup há {{ dias }} dias. Vale exportar de novo.</p>
      <p v-else>Último backup há {{ dias }} dia(s). Tranquilo.</p>
    </div>

    <div class="acoes">
      <BaseButton variante="primario" icone="baixar" @click="exportar">Exportar JSON</BaseButton>
      <BaseButton icone="subir" @click="arquivo?.click()">Importar JSON</BaseButton>
      <input
        ref="arquivo"
        type="file"
        accept="application/json,.json"
        class="sr-only"
        @change="importar"
      />
    </div>

    <hr />

    <div class="secundarias">
      <div>
        <strong>Dados de exemplo</strong>
        <p class="muted">
          Preenche o site com simulados e listas fictícios para você ver como ficam os gráficos.
        </p>
      </div>
      <BaseButton tamanho="sm" @click="carregarExemplo">Carregar</BaseButton>
    </div>

    <div class="secundarias">
      <div>
        <strong>Apagar tudo</strong>
        <p class="muted">Remove simulados e listas. Bancas, áreas e categorias continuam.</p>
      </div>
      <BaseButton tamanho="sm" variante="perigo" icone="lixeira" @click="apagarTudo">
        Apagar
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.backup {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
}

.aviso {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding: var(--s3) var(--s4);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--acerto) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--acerto) 35%, transparent);
  color: var(--acerto);
  font-size: 0.86rem;
}

.aviso.atrasado {
  background: color-mix(in srgb, var(--duvida) 12%, transparent);
  border-color: color-mix(in srgb, var(--duvida) 35%, transparent);
  color: var(--duvida);
}

.aviso p {
  color: var(--text);
}

.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2);
}

hr {
  border: none;
  border-top: 1px solid var(--border);
}

.secundarias {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s4);
}

.secundarias strong {
  font-size: 0.88rem;
}

.secundarias p {
  font-size: 0.8rem;
  margin-top: 2px;
}
</style>
