import {createRouter, createWebHashHistory} from "vue-router";

let router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_BASE_API),
    routes: [
        {
            path: '/',
            component: () => import('@/ScriptExecDemo/playground.vue'),
        }
    ],
});

export default router
