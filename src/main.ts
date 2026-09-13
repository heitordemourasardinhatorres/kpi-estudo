import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from '@/App.vue'
import router from '@/router'
import '@/styles/tokens.css'
import '@/styles/base.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App).use(pinia).use(router)

// ?demo carrega dados de exemplo em dev, útil pra conferir os gráficos preenchidos.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('demo')) {
  const { gerarDadosExemplo } = await import('@/lib/demo')
  const { useSimuladosStore } = await import('@/stores/simulados')
  const { useListasStore } = await import('@/stores/listas')
  const { useConfigStore } = await import('@/stores/config')
  const dados = gerarDadosExemplo()
  dados.metas.forEach(useConfigStore(pinia).salvarMeta)
  useSimuladosStore(pinia).substituir(dados.simulados)
  useListasStore(pinia).substituir(dados.listas)
}

app.mount('#app')
