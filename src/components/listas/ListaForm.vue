<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseField from '@/components/base/BaseField.vue'
import SelectMateria from '@/components/base/SelectMateria.vue'
import { hojeISO } from '@/lib/date'
import { pct } from '@/lib/format'
import { novoId } from '@/lib/id'
import type { ID, Lista } from '@/types'

const props = defineProps<{ lista?: Lista }>()
const emit = defineEmits<{ salvar: [lista: Lista]; cancelar: [] }>()

const form = reactive<{
  titulo: string
  materiaId: ID | undefined
  topico: string
  data: string
  duracaoMin: number | null
  totalQuestoes: number | null
  acertos: number | null
  observacao: string
}>({
  titulo: props.lista?.titulo ?? '',
  materiaId: props.lista?.materiaId,
  topico: props.lista?.topico ?? '',
  data: props.lista?.data ?? hojeISO(),
  duracaoMin: props.lista?.duracaoMin ?? null,
  totalQuestoes: props.lista?.totalQuestoes ?? null,
  acertos: props.lista?.acertos ?? null,
  observacao: props.lista?.observacao ?? '',
})

const erro = ref('')

const aproveitamento = computed(() =>
  form.totalQuestoes && form.totalQuestoes > 0 ? (form.acertos ?? 0) / form.totalQuestoes : null,
)

function salvar(): void {
  if (!form.titulo.trim()) {
    erro.value = 'Dê um nome para a lista.'
    return
  }
  if (!form.totalQuestoes || form.totalQuestoes <= 0) {
    erro.value = 'Informe quantas questões a lista tinha.'
    return
  }
  emit('salvar', {
    id: props.lista?.id ?? novoId(),
    titulo: form.titulo.trim(),
    materiaId: form.materiaId,
    topico: form.topico.trim() || undefined,
    data: form.data,
    duracaoMin: form.duracaoMin ?? undefined,
    totalQuestoes: form.totalQuestoes,
    acertos: Math.min(form.acertos ?? 0, form.totalQuestoes),
    erros: props.lista?.erros ?? [],
    duvidas: props.lista?.duvidas ?? [],
    observacao: form.observacao.trim() || undefined,
  })
}
</script>

<template>
  <form @submit.prevent="salvar">
    <BaseField rotulo="Nome da lista">
      <input v-model="form.titulo" type="text" placeholder="Trigonometria — Prof. Ana" />
    </BaseField>

    <div class="grade">
      <BaseField rotulo="Matéria">
        <SelectMateria v-model="form.materiaId" />
      </BaseField>
      <BaseField rotulo="Tópico" dica="opcional">
        <input v-model="form.topico" type="text" placeholder="Lei dos senos" />
      </BaseField>
      <BaseField rotulo="Quando você fez">
        <input v-model="form.data" type="date" />
      </BaseField>
      <BaseField rotulo="Tempo gasto" dica="minutos">
        <input v-model.number="form.duracaoMin" type="number" min="0" placeholder="60" />
      </BaseField>
      <BaseField rotulo="Total de questões">
        <input v-model.number="form.totalQuestoes" type="number" min="1" placeholder="20" />
      </BaseField>
      <BaseField rotulo="Acertos">
        <input v-model.number="form.acertos" type="number" min="0" placeholder="16" />
      </BaseField>
    </div>

    <p v-if="aproveitamento !== null" class="aproveitamento">
      Aproveitamento: <strong>{{ pct(aproveitamento) }}</strong>
    </p>

    <BaseField rotulo="Observação" dica="opcional">
      <textarea v-model="form.observacao" placeholder="Algo que queira lembrar depois" />
    </BaseField>

    <p v-if="erro" class="aviso">{{ erro }}</p>

    <footer>
      <BaseButton variante="fantasma" @click="emit('cancelar')">Cancelar</BaseButton>
      <BaseButton tipo="submit" variante="primario" icone="check">
        {{ props.lista ? 'Salvar' : 'Registrar lista' }}
      </BaseButton>
    </footer>
  </form>
</template>

<style scoped>
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--s3);
  margin: var(--s3) 0;
}

.aproveitamento {
  margin-bottom: var(--s4);
  font-size: 0.86rem;
  color: var(--text-dim);
}

.aproveitamento strong {
  color: var(--brand-bright);
}

.aviso {
  margin-top: var(--s3);
  color: var(--erro);
  font-size: 0.84rem;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--s2);
  margin-top: var(--s5);
}
</style>
