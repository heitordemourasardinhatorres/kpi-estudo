<script setup lang="ts">
import { computed } from 'vue'
import { ICONES, type NomeIcone } from '@/lib/icones'

const props = withDefaults(defineProps<{ nome: NomeIcone; tamanho?: number }>(), { tamanho: 20 })

const paths = computed(() => ICONES[props.nome])
</script>

<template>
  <svg
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in paths" :key="d" :d="d" />
  </svg>
</template>
