<template>
  <q-dialog v-model="bookmarksStore.showEditBookmarkDialog" transition-show="slide-up" transition-hide="slide-down">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div v-if="!newItem" class="text-h6">Edit Bookmark</div>
        <div v-if="newItem" class="text-h6">New Bookmark</div>
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-md">
          <q-input rounded outlined dense v-model="tempBookmark.name" label="Bookmark name" />
          <q-input rounded outlined dense v-model="tempBookmark.url" label="URL">
            <template v-slot:prepend>
              <q-icon name="link" />
            </template>
          </q-input>
          <q-input rounded outlined dense v-model="tempBookmark.embed" label="Embed">
            <template v-slot:prepend>
              <q-icon name="code" />
            </template>
          </q-input>

          <div class="q-gutter-sm column">
            <q-btn unelevated rounded color="yellow" label="Default icon" @click="changeIcon('default')" />
            <q-btn unelevated rounded color="yellow" label="Original icon" @click="changeIcon('original')" />
            <q-btn unelevated rounded color="yellow" label="Faviconkit icon" @click="changeIcon('faviconkit')" />
            <q-btn unelevated rounded color="yellow" label="Google icon" @click="changeIcon('google')" />
            <q-btn unelevated rounded color="yellow" label="Allesedv icon" @click="changeIcon('allesedv')" />

            <div class="row justify-center" style="width: 100%;">
              <img :src="tempBookmark.icon" alt="icon" style="width:200px;height:200px;" />
            </div>
          </div>

          <q-input rounded outlined dense v-model="tempBookmark.icon" label="Icon in use" />
          <q-checkbox left-label v-model="tempBookmark.newtab" label="Open in new tab" />
          <div class="row justify-around items-center">
            <q-btn unelevated rounded color="secondary" label="Cancel" @click="cancel" />
            <q-btn unelevated rounded color="primary" label="Apply" @click="applyEditBookmarkDialog" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useBookmarks } from '../stores/bookmarks-store'

const bookmarksStore = useBookmarks()
const emit = defineEmits(['build-grid'])
const tempBookmark = ref({
  name: '',
  type: 'bookmark',
  original_icon: '',
  icon: '',
  url: '',
  embed: '',
  newtab: false,
  x: 0,
  y: 0,
  w: 1,
  h: 1,
})
const currentBookmark = ref({
  name: '',
  type: 'bookmark',
  original_icon: '',
  icon: '',
  url: '',
  embed: '',
  newtab: false,
  x: 0,
  y: 0,
  w: 1,
  h: 1,
})

const newItem = ref(null)

const changeIcon = (type) => {
  switch (type) {
    case 'default':
      tempBookmark.value.icon = bookmarksStore.defaultBookmarkIcon
      break
    case 'original':
      tempBookmark.value.icon = tempBookmark.value.original_icon
      break
    case 'faviconkit':
      tempBookmark.value.icon = bookmarksStore.getFaviconkitIcon(tempBookmark.value.url)
      break
    case 'google':
      tempBookmark.value.icon = bookmarksStore.getGoogleIcon(tempBookmark.value.url)
      break
    case 'allesedv':
      tempBookmark.value.icon = bookmarksStore.getAllesedvIcon(tempBookmark.value.url)
      break
  }
}

const applyEditBookmarkDialog = () => {
  bookmarksStore.toggleShowEditBookmarkDialog()
  if (newItem.value === null) {
    Object.assign(currentBookmark.value, tempBookmark.value)
  } else {
    tempBookmark.value.x = newItem.value.x
    tempBookmark.value.y = newItem.value.y
    tempBookmark.value.w = newItem.value.w
    tempBookmark.value.h = newItem.value.h
    bookmarksStore.activeFolder.screens[+bookmarksStore.slide].children.push(tempBookmark.value)
    emit('build-grid')
    newItem.value = null
  }
  bookmarksStore.updateBookmarksContent()
}

const editBookmark = (bookmark, layoutItem = null) => {
  if (layoutItem === null) {
    tempBookmark.value = { ...bookmark }
    bookmarksStore.toggleShowEditBookmarkDialog()
    currentBookmark.value = bookmark
  } else {
    tempBookmark.value = {
      type: 'bookmark',
      name: 'New Bookmark',

      original_icon: bookmarksStore.defaultBookmarkIcon,
      icon: bookmarksStore.defaultBookmarkIcon,
      url: 'https://',
      embed: '',
      newtab: true,
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    }
    newItem.value = layoutItem
    bookmarksStore.toggleShowEditBookmarkDialog()
  }
}

const cancel = () => {
  bookmarksStore.toggleShowEditBookmarkDialog()
  newItem.value = null
}

defineExpose({ editBookmark })

</script>
