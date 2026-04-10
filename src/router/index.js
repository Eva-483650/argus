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
        meta: { title: 'Research' }
      },
      {
        path: 'team',
        name: 'Team',
        component: () => import('@/views/TeamView.vue'),
        meta: { title: 'Team' }
      },
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/ProjectView.vue'),
        meta: { title: 'Project' }
      },
      {
        path: 'downloads',
        name: 'Downloads',
        component: () => import('@/views/DownloadsView.vue'),
        meta: { title: 'Downloads' }
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
  document.title = to.meta.title ? `${to.meta.title} | Housing Research Lab` : 'Housing Research Lab'
  next()
})

export default router
