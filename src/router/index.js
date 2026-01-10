import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/method',
    name: 'TrainingMethod',
    component: () => import('../views/TrainingMethod.vue')
  },
  {
    path: '/company',
    name: 'Company',
    component: () => import('../views/Company.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/Privacy.vue')
  },
  {
    path: '/legal',
    name: 'Legal',
    component: () => import('../views/Legal.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Terms.vue')
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/FAQ.vue')
  },
  {
    path: '/subscription',
    name: 'Subscription',
    component: () => import('../views/Subscription.vue')
  },
  {
    path: '/subscription/success',
    name: 'SubscriptionSuccess',
    component: () => import('../views/SubscriptionSuccess.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue')
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue')
  },
  {
    path: '/chordquizz',
    name: 'ChordQuizz',
    component: () => import('../views/ChordQuizz.vue')
  },
  {
    path: '/songs',
    name: 'SongPlayback',
    component: () => import('../views/SongPlayback.vue')
  },
  {
    path: '/autoplay',
    name: 'AutoPlay',
    component: () => import('../views/AutoPlay.vue')
  },
  {
    path: '/singlenotetest',
    name: 'SingleNoteQuizz',
    component: () => import('../views/SingleNoteQuizz.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
