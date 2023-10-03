<template>
  <div ref="parentDiv" class="backdrop column justify-center items-center"
    @keydown="handleArrowKeysPress">
    <q-input rounded outlined autofocus bg-color="white" bottom-slots v-model="text" label="Background image description"
      :dense="dense" style="width: 50%;" @keyup="handleKeyPressOnInput" clearable>
      <template v-slot:prepend>
        <q-icon name="image" />
      </template>

      <template v-slot:append>
        <q-icon name="search" @click="search" class="cursor-pointer" />
      </template>
    </q-input>

    <div class="row justify-between items-center">
      <q-btn ref="scrollLeftBtn" round color="brown-5" icon="chevron_left" @click="scrollLeft"
        style="margin-right: 20px;"
        v-if="store.backgroundImages[store.activeIndex]"/>
      <q-virtual-scroll :items="store.backgroundImages" virtual-scroll-horizontal v-slot="{ item, index }">
        <q-item :key="index" dense>
          <q-item-section>
            <q-img :src="item.small" spinner-color="white" :ratio="1" :style="{ width: logWidth(virtualScrollWidth) }"
              @click="handleSelect(index)"
              :class="index === store.activeIndex ? 'active-img' : ''"
              class="q-mx-md"/>
          </q-item-section>
        </q-item>
      </q-virtual-scroll>
      <q-btn ref="scrollRightBtn" round color="brown-5" icon="chevron_right" @click="scrollRight"
        style="margin-left: 20px;"
        v-if="store.backgroundImages[store.activeIndex]"/>
    </div>
    <div class="row justify-between items-center" style="width: 50%;"
      v-if="store.backgroundImages[store.activeIndex]">
      <q-btn unelevated rounded color="secondary" label="Cancel" @click="store.changeShowBgModal()"/>
      <q-btn unelevated rounded color="primary" label="Apply" @click="apply" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, onUnmounted } from 'vue'
import { useGeneral } from '../stores/general-store'
import { auth, db } from 'boot/firebase'
import { doc, updateDoc } from "firebase/firestore";

const store = useGeneral()

const text = ref("")
const dense = ref(false)
const parentDiv = ref(null)
const virtualScroll = ref(null)
const virtualScrollWidth = ref(0)
const scrollLeftBtn = ref(null)
const scrollRightBtn = ref(null)

const logWidth = (virtualScrollWidth) => {
  //console.log((virtualScrollWidth / 10).toString() + 'px')
  return (virtualScrollWidth / 6).toString() + 'px'
}

const search = async () => {
  if (text.value !== '') {
    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?count=30&query=${text.value.replace(" ", "+")}`, {
        headers: {
          'Authorization': `Client-ID ${store.UNSPLASH_ACCESS_KEY}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const imageData = await response.json()
      //console.log(imageData)
      store.clearBackgroungImages()
      imageData.forEach((img) => {
        store.addToBackgroungImages({ small: img.urls.small, full: img.urls.full })
      })
    }
    catch (error) {
      console.log(error)
    }
  }
}

const scrollAmount = 200  // Change this value based on how much you want to scroll

const scrollLeft = () => {
  if (virtualScroll.value && virtualScroll.value[0]) {
    virtualScroll.value[0].scrollLeft -= scrollAmount;
  }
}

const scrollRight = () => {
  if (virtualScroll.value && virtualScroll.value[0]) {
    virtualScroll.value[0].scrollLeft += scrollAmount;
  }
}

const handleSelect = (index) => {
  store.updateActiveIndex(index)
}

const handleKeyPressOnInput = (event) => {
  if (event.key === "Enter") {
    search()
  }
  if (event.key === "Escape") {
    text.value = ''
  }
}

const handleArrowKeysPress = (event) => {
  if (event.key === "ArrowRight") {
    scrollRightBtn.value ? scrollRightBtn.value.click() : {}
  }
  if (event.key === "ArrowLeft") {
    scrollLeftBtn.value ? scrollLeftBtn.value.click() : {}
  }
}

const apply = async () => {
  if (auth.currentUser && auth.currentUser.email && store.backgroundImages[store.activeIndex]) {
    const userDoc = doc(db, "users", auth.currentUser?.email)
    try {
      await updateDoc(userDoc, {
        backgroundImage: store.backgroundImages[store.activeIndex].full
      })
      store.currentBackgroundImage = store.backgroundImages[store.activeIndex].full
      store.changeShowBgModal()
      console.log("Document successfully updated!");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }
}

onMounted(async () => {
  const adjustVirtualScrollSize = () => {
    if (parentDiv.value) {  // Check if parentDiv has been initialized
      virtualScroll.value = parentDiv.value.getElementsByClassName("q-virtual-scroll")
      if (virtualScroll.value) {
        const rect = parentDiv.value.getBoundingClientRect();
        virtualScroll.value[0].style.height = `${rect.height * 0.5}px`; // 30% of parent height
        virtualScroll.value[0].style.width = `${rect.width * 0.8}px`;  // 80% of parent width
        virtualScrollWidth.value = rect.width * 0.8;
      }
    }
  }

  // Initial adjustment
  adjustVirtualScrollSize()

  watchEffect(adjustVirtualScrollSize)
  window.addEventListener('resize', adjustVirtualScrollSize)

  // Remember to remove the event listener to prevent memory leaks
  onUnmounted(() => {
    window.removeEventListener('resize', adjustVirtualScrollSize)
  })

})
</script>

<style lang="scss">
.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.q-virtual-scroll::-webkit-scrollbar {
  display: none;
}

.q-virtual-scroll {
  scrollbar-width: none;
  /* For Firefox */
  overflow: -moz-scrollbars-none;
  /* For Firefox */
}

.active-img {
  transform: scale(1.3); /* scales the image up by 50% */
  border: 10px solid $primary; /* thick white border */
  transition: transform 0.3s ease, border 0.3s ease; /* smooth transition for the scale and border changes */
}
</style>
