<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted, inject } from 'vue'
import { auth } from 'src/boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useGeneral } from '../src/stores/general-store'

const $unicornLog = inject('$unicornLog')
const router = useRouter()
const store = useGeneral()

let unsubscribe;

onMounted(() => {
  $unicornLog({
    text: 'Mounted called',
    disabled: store.logsOff,
    styles: ['color: blue'],
    logPrefix: '[App.vue]',
  });
  unsubscribe = onAuthStateChanged(auth, currentUser => {
    if (currentUser) {
      router.push({ name: 'Main' });
      $unicornLog({
        text: 'Logged in as user:',
        disabled: store.logsOff,
        styles: ['color: green'],
        objects: currentUser,
        logPrefix: '[App.vue]',
      })
    } else {
      $unicornLog({
        text: 'No current user, redirecting to SignInPage',
        disabled: store.logsOff,
        styles: ['color: blue'],
        logPrefix: '[App.vue]',
      })
      router.push({ name: 'SignInPage' });
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>
