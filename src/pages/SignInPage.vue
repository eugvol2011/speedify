<template>
  <div class="signup-background row justify-center items-center">
    <q-form class="signup-form q-pa-md column justify-evenly" @submit.prevent="onSubmit" autofocus greedy>
      <!--E-MAIL-->
      <q-input v-model="email" dense label="E-mail" hint="Please enter your e-mail here" :rules="[
        val => !!val || '* Required',
        val => {
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
          return emailRegex.test(val) || 'Invalid e-mail'
        },
      ]" lazy-rules>
        <template v-slot:prepend>
          <q-icon name="email" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="email = ''" class="cursor-pointer" />
        </template>
      </q-input>

      <!--PASSWORD-->
      <q-input :type="!visibility ? 'password' : 'text'" v-model="password" dense label="Password"
        hint="Enter your password here" :rules="[
          val => !!val || '* Required',
        ]" lazy-rules>
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon :name="!visibility ? 'visibility' : 'visibility_off'" @click="visibility = !visibility" />
        </template>
      </q-input>

      <!--BUTTONS-->
      <div class="buttons-container row justify-evenly">
        <q-btn flat rounded color="primary" label="Create an account" @click="$router.push({ name: 'SignUpPage' })" />
        <q-btn unelevated rounded color="primary" label="Sign In" type="submit" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from 'boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const visibility = ref(false)

const onSubmit = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push({ name: 'Main' })
  } catch (error) {
    console.error('Error signing in:', error.message);
  }
}
</script>

<style lang="scss">
.signup-background {
  width: 100vw;
  height: 100vh;
  background-color: $cyan-4;
}

.signup-form {
  width: 30%;
  height: 50%;
  background-color: white;
}
</style>
