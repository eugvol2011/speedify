<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { auth } from 'src/boot/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

let unsubscribe;

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, currentUser => {
    if (currentUser) {
      router.push({ name: 'Main' });
      console.log(currentUser);
    } else {
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
