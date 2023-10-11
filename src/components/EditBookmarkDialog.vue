<template>
  <q-dialog v-model="bookmarksStore.showEditBookmarkDialog" transition-show="slide-up" transition-hide="slide-down">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Edit Bookmark</div>
        </q-card-section>

        <q-card-section>
          <div class="column q-gutter-lg">
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
            <q-input rounded outlined dense v-model="tempBookmark.icon" label="Base64 icon" />
            <q-checkbox left-label v-model="tempBookmark.newtab" label="Open in new tab" />
            <div class="row justify-around items-center">
              <q-btn unelevated rounded color="secondary" label="Cancel" @click="bookmarksStore.toggleShowEditBookmarkDialog()" />
              <q-btn unelevated rounded color="primary" label="Apply" @click="applyEditBookmarkDialog" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useBookmarks } from '../stores/bookmarks-store'

const bookmarksStore = useBookmarks()
const tempBookmark = ref({
  name: '',
  type: 'bookmark',
  icon: '',
  url: '',
  embed: '',
  newtab: false,
  x: 1,
  y: 1,
})
const currentBookmark = ref({
  name: '',
  type: 'bookmark',
  icon: '',
  url: '',
  embed: '',
  newtab: false,
  x: 1,
  y: 1,
})

const applyEditBookmarkDialog = () => {
  bookmarksStore.toggleShowEditBookmarkDialog()
  Object.assign(currentBookmark.value, tempBookmark.value)
}

const editBookmark = (bookmark) => {
  tempBookmark.value = { ...bookmark }
  bookmarksStore.toggleShowEditBookmarkDialog()
  currentBookmark.value = bookmark
}

defineExpose({editBookmark})

</script>
