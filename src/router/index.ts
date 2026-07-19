import { createRouter, createWebHistory } from 'vue-router'
import AllPostsView from '../views/AllPostsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'posts',
      component: AllPostsView,
    },
    {
      path: '/add',
      name: 'add-post',
      component: () => import('../views/AddPostView.vue'),
    },
    {
      path: '/edit/:id',
      name: 'edit-post',
      component: () => import('../views/EditPostView.vue'),
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import('../views/PreviewView.vue'),
    },
  ],
})

export default router
