import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/research'
  },
  {
    path: '/',
    component: () => import('@/views/layout/LayoutView.vue'),
    children: [
      {
        path: 'research',
        name: 'Research',
        component: () => import('@/views/ResearchView.vue'),
        meta: { title: '研究展示' }
      },
      {
        path: 'team',
        name: 'Team',
        component: () => import('@/views/TeamView.vue'),
        meta: { title: '团队成员' }
      },
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/ProjectView.vue'),
        meta: { title: '项目介绍' }
      },
      {
        path: 'downloads',
        name: 'Downloads',
        component: () => import('@/views/DownloadsView.vue'),
        meta: { title: '资料下载' }
      },
      // {
      //   path: 'contact',
      //   name: 'Contact',
      //   component: () => import('@/views/ContactView.vue'),
      //   meta: { title: 'Contact' }
      // }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/research'
  }
]

const router = createRouter({
  // Hash history avoids 404s when the app is hosted from a BaoTa subdirectory.
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | Argus` : 'Argus'
  next()
})

export default router
