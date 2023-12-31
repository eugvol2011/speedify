<template>
  <q-layout view="hHh lpR fFf">
    <q-drawer v-model="leftDrawerOpen" side="left" elevated>
      <q-list>
        <q-item-label header>
          SpeedifyWeb version 1.0
        </q-item-label>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container class="container" @dblclick="onDblClick">
      <q-img :src="store.currentBackgroundImage !== undefined ? store.currentBackgroundImage : ''" spinner-color="white"
        style="position: absolute; top:0px; left:0px; width: 100%; height: 100%; z-index: -2;" class="background-image" />
      <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer"
        style="color: white;background-color: rgba(0, 0, 0, 0.5);" />
      <router-view />
      <BgModal v-if="store.showBgModal" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useGeneral } from '../stores/general-store'
import EssentialLink from 'components/EssentialLink.vue'
import BgModal from 'components/BgModal.vue'
import { ref, onBeforeMount, inject } from 'vue'
import { auth } from 'boot/firebase'
import { useRouter } from 'vue-router'

const $unicornLog = inject('$unicornLog')
const store = useGeneral()
const router = useRouter()

const linksList = [
  {
    title: 'Bookmarks',
    caption: 'Use and manage your bookmarks',
    icon: 'bookmarks',
    link: () => { router.push({ name: 'Bookmarks' }); }
  },
  {
    title: 'ToDo List',
    caption: 'Manage your tasks and reminders',
    icon: 'check_circle',
    link: () => { router.push({ name: 'Todo' }); }
  },
  {
    title: 'Sign Out',
    caption: '',
    icon: 'exit_to_app',
    link: () => { router.push('/sign-out'); }
  }
]

const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const onDblClick = (event) => {
  if (!Array.from(event.target.classList).includes('vgl-item') && !Array.from(event.target.classList).includes('icon')) {
    store.changeShowBgModal();
    leftDrawerOpen.value = false;
  }
}

onBeforeMount(async () => {
  $unicornLog({
    text: 'onBeforeMount called',
    disabled: store.logsOff,
    logPrefix: '[MainLayout.vue]',
    styles: ['color: blue']
  })
  if (!auth.currentUser) {
    $unicornLog({
      text: 'No user logged in, redirecting to SignInPage',
      disabled: store.logsOff,
      logPrefix: '[MainLayout.vue]',
      styles: ['color: blue']
    })
    router.push({ name: 'SignInPage' })
  } else {
    await store.fetchBackgroundImage()
    $unicornLog({
      text: `Fetched backgroundImage:\n ${store.currentBackgroundImage}`,
      disabled: store.logsOff,
      logPrefix: '[MainLayout.vue]',
      styles: ['color: green']
    })
  }
})
</script>

<style>
.container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
