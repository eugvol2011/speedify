<template></template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { auth } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router'

const router = useRouter()

const logOut = async () => {
  try {
    await signOut(auth);
    router.push({ name: 'SignInPage' })
  } catch (error) {
    router.push({ name: 'Main' })
    console.error('Error signing out:', error);
  }
}

onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          await logOut()
        } else {
          router.push({ name: 'SignInPage'})
        }
      });

      onUnmounted(() => {
        unsubscribe()
      });
})
</script>
