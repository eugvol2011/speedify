import SignInPage from '../pages/SignInPage.vue'
import SignUpPage from '../pages/SignUpPage.vue'
import SignOutPage from '../pages/SignOutPage.vue'
import App from '../App.vue'

const routes = [
  {
    path: '/',
    name: 'App',
    component: App
  },
  {
    path: '/sign-in',
    name: 'SignInPage',
    component: SignInPage
  },
  {
    path: '/sign-up',
    name: 'SignUpPage',
    component: SignUpPage
  },
  {
    path: '/sign-out',
    name: 'SignOutPage',
    component: SignOutPage
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('layouts/MainLayout.vue'),
    redirect: { name: 'Bookmarks' },
    children: [
      { path: '', component: () => import('pages/BookmarksPage.vue'), name: 'Bookmarks' },
      { path: 'todo', component: () => import('pages/ToDoPage.vue'), name: 'Todo' },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
