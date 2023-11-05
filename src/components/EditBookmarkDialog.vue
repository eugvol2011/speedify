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
            <div class="row">
              <q-radio v-model="iconModel" checked-icon="task_alt" unchecked-icon="panorama_fish_eye"
                val="faviconkit_icon" label="" style="width: 7%;" />
              <q-input rounded outlined dense v-model="tempBookmark.faviconkit_icon" label="Faviconkit icon"
                style="width: 93%;" />
            </div>
            <div class="row">
              <q-radio v-model="iconModel" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="google_icon"
                label="" style="width: 7%;" />
              <q-input rounded outlined dense v-model="tempBookmark.google_icon" label="Google icon"
                style="width: 93%;" />
            </div>
            <div class="row">
              <q-radio v-model="iconModel" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="original_icon"
                label="" style="width: 7%;" />
              <q-input rounded outlined dense v-model="tempBookmark.original_icon" label="Original icon"
                style="width: 93%;" />
            </div>

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
import { updateBookmarksContent } from '../functions/general-functions'

const bookmarksStore = useBookmarks()
const emit = defineEmits(['build-grid'])
const tempBookmark = ref({
  name: '',
  type: 'bookmark',
  faviconkit_icon: '',
  google_icon: '',
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
  faviconkit_icon: '',
  google_icon: '',
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

const iconModel = ref('faviconkit_icon')
watch(iconModel, () => {
  tempBookmark.value.icon = tempBookmark.value[iconModel.value]
})


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
  updateBookmarksContent()
}

const editBookmark = (bookmark, layoutItem = null) => {
  if (layoutItem === null) {
    tempBookmark.value = { ...bookmark }
    bookmarksStore.toggleShowEditBookmarkDialog()
    currentBookmark.value = bookmark
  } else {
    tempBookmark.value = bookmarksStore.createBookmarkObject(
      'bookmark',
      'New Bookmark',
      bookmarksStore.defaultBookmarkIcon,
      'https://marvellous-sapphire-chipmunk.faviconkit.com/host/256',
      'https://www.google.com/s2/favicons?domain=host&sz=256',
      bookmarksStore.defaultBookmarkIcon,
      '',
      '',
      false,
      0,
      0,
      1,
      1
    )
    console.log(tempBookmark.value)
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
