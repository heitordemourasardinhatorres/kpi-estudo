import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { titulo: 'Início' } },
  {
    path: '/simulados',
    name: 'simulados',
    component: () => import('@/views/SimuladosView.vue'),
    meta: { titulo: 'Simulados' },
  },
  {
    path: '/simulados/:id',
    name: 'simulado',
    component: () => import('@/views/SimuladoDetalheView.vue'),
    props: true,
    meta: { titulo: 'Simulado' },
  },
  {
    path: '/listas',
    name: 'listas',
    component: () => import('@/views/ListasView.vue'),
    meta: { titulo: 'Listas' },
  },
  {
    path: '/listas/:id',
    name: 'lista',
    component: () => import('@/views/ListaDetalheView.vue'),
    props: true,
    meta: { titulo: 'Lista' },
  },
  {
    path: '/duvidas',
    name: 'duvidas',
    component: () => import('@/views/DuvidasView.vue'),
    meta: { titulo: 'Dúvidas' },
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    component: () => import('@/views/ConfiguracoesView.vue'),
    meta: { titulo: 'Configurações' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const titulo = to.meta.titulo as string | undefined
  document.title = titulo ? `${titulo} · Juju na Aprovação` : 'Juju na Aprovação'
})

export default router
