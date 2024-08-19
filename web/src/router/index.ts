import { useGlobalStore } from '@/stores/global';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/views/index.vue'),
        },
        {
            path: '/account',
            component: () => import('@/views/Account.vue'),
        },
        {
            path: '/filemanage',
            // todo 各类文档的不同管理页面
            component: () => import('@/views/KanbanList.vue'),
        },
        {
            path: '/kanban',
            component: () => import('@/views/BoardView.vue'),
        },
        {
            path: '/script',
            component: () => import('@/script/playground.vue'),
        }
    ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const globalStore = useGlobalStore();
    // todo 验证登录状态
    if (to.path !== '/account' && !globalStore.user.token) {
        next('/account');
    } else {
        next();
    }
})

export default router
