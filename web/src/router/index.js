import {createRouter, createWebHashHistory} from "vue-router";

let router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_BASE_API),
    routes: [
        {
            path: '/',
            component: () => import('@/board/demo.vue'),
        },
        {
            path: '/script',
            component: () => import('@/script/playground.vue'),
        },
        {
            path: '/vditor',
            component: () => import('@/components/editor/index.vue'),
        }
    ],
});

export default router
