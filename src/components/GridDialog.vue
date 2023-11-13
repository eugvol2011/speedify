<template>
  <q-dialog v-model="bookmarksStore.showGridDialog">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Select number of columns and rows for the page</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-lg">
          <q-btn-dropdown color="primary" :label="`Columns: ${currentCols}`">
            <q-list>
              <q-item v-for="index in 19" clickable v-close-popup  @click="currentCols = index + 1">
                <q-item-section>
                  {{ index + 1 }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn-dropdown color="primary" :label="`Rows: ${currentRows}`">
            <q-list>
              <q-item v-for="index in 20" clickable v-close-popup @click="currentRows = index">
                <q-item-section>
                  {{ index }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <div class="row justify-center items-center">
            <q-btn unelevated rounded color="secondary" label="Cancel" @click="bookmarksStore.toggleShowGridDialog()" />
            <q-btn unelevated rounded color="primary" @click="applyGrid" label="Apply" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useBookmarks } from 'src/stores/bookmarks-store';
import { ref, onMounted } from 'vue'
//import { updateBookmarksContent } from '../functions/general-functions'

const bookmarksStore = useBookmarks()

const currentCols = ref(bookmarksStore.activeFolder.screens[+bookmarksStore.slide].cols)
const currentRows = ref(bookmarksStore.activeFolder.screens[+bookmarksStore.slide].rows)
const emit = defineEmits(['build-grid'])

const applyGrid = () => {
    bookmarksStore.activeFolder.screens[+bookmarksStore.slide].cols = currentCols.value
    bookmarksStore.activeFolder.screens[+bookmarksStore.slide].rows = currentRows.value
    bookmarksStore.toggleShowGridDialog()
    emit('build-grid')
    bookmarksStore.updateBookmarksContent()
}

onMounted(() => {
  console.log('cols', bookmarksStore.activeFolder.screens[+bookmarksStore.slide].cols)
  console.log('rows', bookmarksStore.activeFolder.screens[+bookmarksStore.slide].rows)
  currentCols.value = bookmarksStore.activeFolder.screens[+bookmarksStore.slide].cols
  currentRows.value = bookmarksStore.activeFolder.screens[+bookmarksStore.slide].rows
})


</script>
