<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import ToastHost from '@/components/base/ToastHost.vue'
import { useDuvidas } from '@/composables/useDuvidas'
import type { NomeIcone } from '@/lib/icones'

const route = useRoute()
const { pendentes } = useDuvidas()

/** `/simulados/:id` também acende o item "Simulados" — rotas de detalhe não são aninhadas. */
const ativo = (para: string) => (para === '/' ? route.path === '/' : route.path.startsWith(para))

interface ItemNav {
  para: string
  rotulo: string
  icone: NomeIcone
  badge?: number
}

const itens = computed<ItemNav[]>(() => [
  { para: '/', rotulo: 'Início', icone: 'casa' },
  { para: '/simulados', rotulo: 'Simulados', icone: 'simulados' },
  { para: '/listas', rotulo: 'Listas', icone: 'listas' },
  { para: '/duvidas', rotulo: 'Dúvidas', icone: 'duvidas', badge: pendentes.value.length },
  { para: '/configuracoes', rotulo: 'Ajustes', icone: 'config' },
])
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <RouterLink to="/" class="marca">
        <span class="marca-icone">J</span>
        <span class="marca-texto">
          <strong>Juju</strong>
          <small>na aprovação</small>
        </span>
      </RouterLink>

      <nav class="nav">
        <RouterLink
          v-for="item in itens"
          :key="item.para"
          :to="item.para"
          class="nav-item"
          :class="{ ativo: ativo(item.para) }"
        >
          <BaseIcon :nome="item.icone" />
          <span>{{ item.rotulo }}</span>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>
    </aside>

    <header class="topo">
      <RouterLink to="/" class="marca compacta">
        <span class="marca-icone">J</span>
        <strong>Juju na aprovação</strong>
      </RouterLink>
    </header>

    <main class="conteudo">
      <RouterView v-slot="{ Component }">
        <Transition name="pagina" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <nav class="tabbar">
      <RouterLink
        v-for="item in itens"
        :key="item.para"
        :to="item.para"
        class="tab"
        :class="{ ativo: ativo(item.para) }"
      >
        <span class="tab-icone">
          <BaseIcon :nome="item.icone" :tamanho="22" />
          <span v-if="item.badge" class="ponto" />
        </span>
        <span>{{ item.rotulo }}</span>
      </RouterLink>
    </nav>

    <ToastHost />
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
}

.marca {
  display: flex;
  align-items: center;
  gap: var(--s3);
  color: var(--text);
}

.marca-icone {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(140deg, var(--brand), #0b6f80);
  color: var(--on-brand);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
}

.marca-texto {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.marca-texto strong {
  font-family: var(--font-display);
  font-size: 1.05rem;
}

.marca-texto small {
  color: var(--text-dim);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ---------- desktop ---------- */
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-w);
  padding: var(--s6) var(--s4);
  border-right: 1px solid var(--border);
  background: var(--bg-elev);
  display: flex;
  flex-direction: column;
  gap: var(--s7);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding: 10px var(--s3);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: var(--surface);
  color: var(--text);
}

.nav-item.ativo {
  background: var(--surface-2);
  color: var(--brand-bright);
}

.badge {
  margin-left: auto;
  min-width: 20px;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--accent);
  color: var(--on-brand);
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
}

.conteudo {
  margin-left: var(--sidebar-w);
  padding: var(--s7) var(--s6) var(--s8);
  max-width: 1180px;
}

.topo,
.tabbar {
  display: none;
}

/* ---------- mobile ---------- */
@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .conteudo {
    margin-left: 0;
    padding: var(--s4) var(--s4) calc(var(--tabbar-h) + var(--s7));
  }

  .topo {
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 20;
    padding: var(--s3) var(--s4);
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(10px);
  }

  .marca.compacta strong {
    font-family: var(--font-display);
    font-size: 0.98rem;
  }

  .tabbar {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    position: fixed;
    inset: auto 0 0 0;
    z-index: 30;
    height: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg-elev) 94%, transparent);
    backdrop-filter: blur(10px);
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--text-faint);
    font-size: 0.67rem;
    font-weight: 500;
  }

  .tab.ativo {
    color: var(--brand-bright);
  }

  .tab-icone {
    position: relative;
  }

  .ponto {
    position: absolute;
    top: -1px;
    right: -3px;
    width: 7px;
    height: 7px;
    border-radius: 99px;
    background: var(--accent);
  }
}

.pagina-enter-active,
.pagina-leave-active {
  transition: opacity 0.18s ease, translate 0.18s ease;
}

.pagina-enter-from {
  opacity: 0;
  translate: 0 6px;
}

.pagina-leave-to {
  opacity: 0;
  translate: 0 -4px;
}
</style>
