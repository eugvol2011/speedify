<template>
  <div class="signup-background row justify-center items-center">
    <q-form class="signup-form q-pa-md column justify-evenly" @submit.prevent="onSubmit" autofocus greedy>
      <!--E-MAIL-->
      <q-input v-model="email" :dense="true" label="E-mail" hint="Please enter your e-mail here" :rules="[
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
      <q-input :type="!visibility ? 'password' : 'text'" v-model="password" :dense="true" label="Password"
        hint="Minimum 6 characters" :rules="[
          val => !!val || '* Required',
          val => val.length >= 6 || 'Must me 6 characters or more'
        ]" lazy-rules>
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon :name="!visibility ? 'visibility' : 'visibility_off'" @click="visibility = !visibility" />
        </template>
      </q-input>

      <!--CONFIRM PASSWORD-->
      <q-input :type="!visibility ? 'password' : 'text'" v-model="confirmPassword" :dense="true" label="Confirm password"
        counter hint="" :rules="[
          confirmPassword => !!confirmPassword || '* Required',
          confirmPassword => {
            return password === confirmPassword || 'Passwords mismatch'
          }
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
        <q-btn flat rounded color="primary" label="I have an account" @click="$router.push({ name: 'SignInPage' })" />
        <q-btn unelevated rounded color="primary" label="Sign Up" type="submit" />
      </div>
      <hr>
      <q-btn flat rounded color="primary" label="Sign in with" @click="signInWithGoogle">
        <q-icon class="custom-icon q-ml-md" />
      </q-btn>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth, db } from 'boot/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { collection, addDoc } from 'firebase/firestore'
import { doc, setDoc } from "firebase/firestore"
import { useBookmarks } from '../stores/bookmarks-store'

const bookmarksStore = useBookmarks()

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const visibility = ref(false)

const createUserInDB = async() => {
  try {
    const userEmail = auth.currentUser?.email;

    if (!userEmail) {
      throw new Error("User not authenticated");
    }

    const userDocRef = doc(db, "users", userEmail);  // using email as the doc ID
    const dataToAdd = {
      name: "",
      email: auth.currentUser?.email,
      backgroundImage: "",
      avatarPicture: "",
      bookmarksContent: JSON.stringify(bookmarksStore.rootNode)
    };

    await setDoc(userDocRef, dataToAdd);  // setDoc will create or overwrite the document

    console.log("Document written/updated for user:", userEmail);
  } catch (e) {
    console.error("Error adding/updating document: ", e);
  }
}

//SIGN UP WITH E-MAIL AND PASSWORD
const onSubmit = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    await createUserInDB()
    router.push({ name: 'Main' })
  } catch (error) {
    console.error('Error registering user:', error.message)
    // Optionally, display an error message to the user
  }
}

//SIGN UP WITH GOOGLE ACCOUNT
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  try {
    await signInWithPopup(auth, provider)
    await createUserInDB()
    router.push({ name: 'Main' })
  } catch (error) {
    console.error('Error signing in with Google:', error.message)
    // Optionally, display an error message to the user
  }
}
</script>

<style lang="scss">
.custom-icon {
  background: url('../google.svg') center/cover no-repeat;
  height: 24px;
  width: 24px;
  font-family: 'Arial', sans-serif;
  color: transparent;
  text-align: center;
  line-height: 24px;
}

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

hr {
  border: none;
  height: 2px;
  background-color: #ddd;
  margin: 10px 0;
}
</style>
