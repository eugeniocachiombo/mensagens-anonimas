import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/home/generate', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { theme: 'dark', tabs: true } },
    { path: '/inbox', name: 'inbox', component: () => import('@/views/InboxView.vue'), meta: { theme: 'dark', tabs: true } },
    { path: '/inbox/:id', name: 'message', component: () => import('@/views/MessageView.vue'), meta: { theme: 'dark' } },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { theme: 'dark', tabs: true } },
    { path: '/u/:slug', name: 'send', component: () => import('@/views/SendView.vue'), meta: { theme: 'light' } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
