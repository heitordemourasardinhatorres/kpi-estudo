<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import SelectMateria from '@/components/base/SelectMateria.vue'
import { totalErros } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import type { ID, RegistroErro } from '@/types'

const props = defineProps<{ erros: RegistroErro[] }>()
const emit = defineEmits<{
  adicionar: [erro: Omit<RegistroErro, 'id'>]
  remover: [id: ID]
  rapido: [categoriaId: ID, delta: number]
}>()

const config = useConfigStore()

const modo = ref<'detalhado' | 'rapido'>('detalhado')

const detalhados = computed(() => props.erros.filter((e) => e.questao || e.materiaId))
const rapidos = computed(() => props.erros.filter((e) => !e.questao && !e.materiaId))
const total = computed(() => totalErros(props.erros))

const contagemRapida = (categoriaId: ID) =>
  rapidos.value.filter((e) => e.categoriaId === categoriaId).reduce((a, e) => a + e.quantidade, 0)

const novo = reactive<{ questao: string; categoriaId: ID; materiaId: ID | undefined; descricao: string }>({
  questao: '',
  categoriaId: config.categoriasAtivas[0]?.id ?? '',
  materiaId: undefined,
  descricao: '',
})

function adicionar(): void {
  if (!novo.categoriaId) return
  emit('adicionar', {
    quantidade: 1,
    categoriaId: novo.categoriaId,
    questao: novo.questao.trim() || undefined,
    materiaId: novo.materiaId,
    descricao: novo.descricao.trim() || undefined,
  })
  novo.questao = ''
  novo.descricao = ''
}
</script>

<template>
  <div>
    <div class="topo">
      <div class="modos">
        <button
          type="button"
          :class="{ ativo: modo === 'detalhado' }"
          @click="modo = 'detalhado'"
        >
          Detalhado
        </button>
        <button type="button" :class="{ ativo: modo === 'rapido' }" @click="modo = 'rapido'">
          Rápido
        </button>
      </div>
      <span class="muted total">{{ total }} erro{{ total === 1 ? '' : 's' }}</span>
    </div>

    <template v-if="modo === 'detalhado'">
      <ul v-if="detalhados.length" class="linhas">
        <li v-for="erro in detalhados" :key="erro.id" class="linha">
          <input v-model="erro.questao" type="text" class="questao" aria-label="Questão" />
          <select v-model="erro.categoriaId" aria-label="Categoria do erro">
            <option v-for="c in config.categorias" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
          <SelectMateria v-model="erro.materiaId" />
          <input
            v-model="erro.descricao"
            type="text"
            class="descricao"
            placeholder="o que aconteceu"
            aria-label="Descrição do erro"
          />
          <button type="button" class="apagar" aria-label="Apagar erro" @click="emit('remover', erro.id)">
            <BaseIcon nome="x" :tamanho="15" />
          </button>
        </li>
      </ul>
      <p v-else class="muted vazio">Nenhum erro detalhado ainda.</p>

      <form class="novo" @submit.prevent="adicionar">
        <input v-model="novo.questao" type="text" class="questao" placeholder="Q7" aria-label="Questão" />
        <select v-model="novo.categoriaId" aria-label="Categoria do erro">
          <option v-for="c in config.categoriasAtivas" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
        <SelectMateria v-model="novo.materiaId" />
        <input
          v-model="novo.descricao"
          type="text"
          class="descricao"
          placeholder="o que aconteceu (opcional)"
          aria-label="Descrição do erro"
        />
        <BaseButton tipo="submit" variante="primario" tamanho="sm" icone="mais">Anotar</BaseButton>
      </form>
    </template>

    <div v-else class="rapido">
      <p class="muted dica">
        Sem detalhar questão nem matéria. Entra na composição dos erros, mas fica de fora do ranking
        de pontos fracos.
      </p>
      <div class="contadores">
        <div v-for="categoria in config.categoriasAtivas" :key="categoria.id" class="contador">
          <span class="ponto-cor" :style="{ background: categoria.cor }" />
          <span class="nome">{{ categoria.nome }}</span>
          <button
            type="button"
            :aria-label="`Menos um em ${categoria.nome}`"
            :disabled="contagemRapida(categoria.id) === 0"
            @click="emit('rapido', categoria.id, -1)"
          >
            −
          </button>
          <strong>{{ contagemRapida(categoria.id) }}</strong>
          <button
            type="button"
            :aria-label="`Mais um em ${categoria.nome}`"
            @click="emit('rapido', categoria.id, 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s3);
}

.modos {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 99px;
}

.modos button {
  padding: 4px 14px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-dim);
}

.modos button.ativo {
  background: var(--surface-2);
  color: var(--brand-bright);
}

.total {
  font-size: 0.82rem;
}

.vazio {
  font-size: 0.85rem;
  padding: var(--s3) 0;
}

.linha {
  flex-wrap: wrap;
}

.questao {
  width: 62px;
  flex: none;
  text-align: center;
  font-weight: 600;
}

.descricao {
  flex: 1;
  min-width: 130px;
}

select {
  width: auto;
  min-width: 108px;
  padding: 5px 26px 5px 9px;
  font-size: 0.82rem;
  background-position: calc(100% - 14px) 14px, calc(100% - 9px) 14px;
}

.novo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s2);
  margin-top: var(--s3);
  padding-top: var(--s3);
  border-top: 1px dashed var(--border);
}

.apagar {
  color: var(--text-faint);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.apagar:hover {
  color: var(--erro);
  background: color-mix(in srgb, var(--erro) 14%, transparent);
}

.dica {
  font-size: 0.8rem;
  margin-bottom: var(--s3);
}

.contadores {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: var(--s2);
}

.contador {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 7px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.contador .nome {
  flex: 1;
  font-size: 0.85rem;
}

.contador button {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: 1rem;
  line-height: 1;
}

.contador button:hover:not(:disabled) {
  color: var(--brand-bright);
}

.contador button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.contador strong {
  min-width: 20px;
  text-align: center;
  font-size: 0.92rem;
}
</style>
