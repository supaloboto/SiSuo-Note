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
        },
        {
            path: '/vditor',
            component: () => import('@/components/blocks/note/editor/editor.vue'),
        }
    ],
})

export default router
