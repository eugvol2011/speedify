<template>
  <q-dialog v-model="bookmarksStore.showEditFolderDialog" transition-show="slide-up" transition-hide="slide-down">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div v-if="!newItem" class="text-h6">Edit Folder</div>
        <div v-if="newItem" class="text-h6">New Folder</div>
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-md">
          <q-input rounded autofocus autoselect outlined dense v-model="tempFolder.name" label="Folder name" />
          <div class="row justify-around items-center">
            <q-btn unelevated rounded color="secondary" label="Cancel"
              @click="cancel" />
            <q-btn unelevated rounded color="primary" label="Apply" @click="applyEditFolderDialog" />
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
const tempFolder = ref({
  type: "folder",
  name: "New Folder",
  icon: bookmarksStore.defaultFolderIcon,
  screens: [
    {
      cols: bookmarksStore.defaultCols,
      rows: bookmarksStore.defaultRows,
      margin: bookmarksStore.defaultMargin,
      children: []
    }
  ],
  x: 0,
  y: 0,
})
const currentFolder = ref({
  type: "folder",
  name: "",
  icon: bookmarksStore.defaultFolderIcon,
  screens: [
    {
      cols: bookmarksStore.defaultCols,
      rows: bookmarksStore.defaultRows,
      margin: bookmarksStore.defaultMargin,
      children: []
    }
  ],
  x: 0,
  y: 0,
})

const newItem = ref(null)


const applyEditFolderDialog = () => {
  bookmarksStore.toggleShowEditFolderDialog()
  if (newItem.value === null) {
    Object.assign(currentFolder.value, tempFolder.value)
  } else {
    tempFolder.value.x = newItem.value.x
    tempFolder.value.y = newItem.value.y
    bookmarksStore.activeFolder.screens[+bookmarksStore.slide].children.push(tempFolder.value)
    emit('build-grid')
    newItem.value = null
  }
  updateBookmarksContent()
}

const editFolder = (folder, layoutItem = null) => {
  if (layoutItem === null) {
    tempFolder.value = { ...folder }
    bookmarksStore.toggleShowEditFolderDialog()
    currentFolder.value = folder
  } else {
    tempFolder.value = {
      type: "folder",
      name: "New Folder",
      icon: bookmarksStore.defaultFolderIcon,
      screens: [
        {
          cols: bookmarksStore.defaultCols,
          rows: bookmarksStore.defaultRows,
          margin: bookmarksStore.defaultMargin,
          children: []
        }
      ],
      x: 0,
      y: 0,
    }
    newItem.value = layoutItem
    bookmarksStore.toggleShowEditFolderDialog()
  }
}

const cancel = () => {
  bookmarksStore.toggleShowEditFolderDialog()
  newItem.value = null
}

defineExpose({ editFolder })

</script>
