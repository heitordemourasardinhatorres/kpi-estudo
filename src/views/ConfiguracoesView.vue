<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import SecaoAreas from '@/components/config/SecaoAreas.vue'
import SecaoBackup from '@/components/config/SecaoBackup.vue'
import SecaoBancas from '@/components/config/SecaoBancas.vue'
import SecaoCategorias from '@/components/config/SecaoCategorias.vue'
import SecaoMetas from '@/components/config/SecaoMetas.vue'

const abas = [
  { id: 'bancas', rotulo: 'Bancas' },
  { id: 'areas', rotulo: 'Áreas e matérias' },
  { id: 'categorias', rotulo: 'Categorias de erro' },
  { id: 'metas', rotulo: 'Metas' },
  { id: 'backup', rotulo: 'Backup' },
] as const

type Aba = (typeof abas)[number]['id']

const aba = ref<Aba>('bancas')
</script>

<template>
  <div>
    <header class="pagina-cabecalho">
      <div>
        <h1>Configurações</h1>
        <p>O que você cadastra aqui aparece nos formulários de simulado e de lista.</p>
      </div>
    </header>

    <nav class="abas">
      <button
        v-for="item in abas"
        :key="item.id"
        type="button"
        class="aba"
        :class="{ ativa: aba === item.id }"
        @click="aba = item.id"
      >
        {{ item.rotulo }}
      </button>
    </nav>

    <BaseCard>
      <SecaoBancas v-if="aba === 'bancas'" />
      <SecaoAreas v-else-if="aba === 'areas'" />
      <SecaoCategorias v-else-if="aba === 'categorias'" />
      <SecaoMetas v-else-if="aba === 'metas'" />
      <SecaoBackup v-else />
    </BaseCard>
  </div>
</template>

<style scoped>
.abas {
  display: flex;
  gap: var(--s1);
  margin-bottom: var(--s4);
  overflow-x: auto;
  padding-bottom: 2px;
}

.aba {
  padding: 7px 14px;
  border-radius: 99px;
  color: var(--text-dim);
  font-size: 0.86rem;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: background 0.15s ease, color 0.15s ease;
}

.aba:hover {
  color: var(--text);
  background: var(--surface);
}

.aba.ativa {
  background: var(--surface-2);
  border-color: var(--border-strong);
  color: var(--brand-bright);
}
</style>
