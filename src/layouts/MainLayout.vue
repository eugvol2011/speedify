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
        style="position: absolute; top:0px; left:0px; width: 100%; height: 100%; z-index: -2;"
        class="background-image"
      />
      <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
      <router-view />
      <BgModal v-if="store.showBgModal" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useGeneral } from '../stores/general-store'
import EssentialLink from 'components/EssentialLink.vue'
import BgModal from 'components/BgModal.vue'
import { ref, onBeforeMount } from 'vue'
import { auth } from 'boot/firebase'
import { useRouter } from 'vue-router'

const store = useGeneral()
const router = useRouter()

const linksList = [
  {
    title: 'Bookmarks',
    caption: 'Use and manage your bookmarks',
    icon: 'bookmarks',
    link: () => { router.push({ name: 'Bookmarks'}); }
  },
  {
    title: 'ToDo List',
    caption: 'Manage your tasks and reminders',
    icon: 'check_circle',
    link: () => { router.push({ name: 'Todo'}); }
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
  console.log("DBL CLICKED")
  let targetElement = event.target;
  let outside = true

  while (targetElement != null) {
    console.log(targetElement)
    if (targetElement.classList.contains('q-btn') || targetElement.classList.contains('q-card')) {
      outside = false
      return
    }
    targetElement = targetElement.parentElement;
  }

  if (outside) {
    store.changeShowBgModal();
    leftDrawerOpen.value = false;
  }
}

onBeforeMount(async () => {
  if (!auth.currentUser) {
    router.push({ name: 'SignInPage' })
  } else {
    await store.fetchBackgroundImage()
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
