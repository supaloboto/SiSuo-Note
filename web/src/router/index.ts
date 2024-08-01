import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/views/BoardView.vue'),
        },
        {
            path: '/script',
            component: () => import('@/script/playground.vue'),
        }
    ],
})

export default router
