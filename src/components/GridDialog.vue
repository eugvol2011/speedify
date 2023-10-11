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
import { ref, watch } from 'vue'

const bookmarksStore = useBookmarks()

const currentCols = ref(bookmarksStore.activeFolder ? bookmarksStore.activeFolder.cols : 20)
const currentRows = ref(bookmarksStore.activeFolder ? bookmarksStore.activeFolder.rows : 20)

const applyGrid = () => {
  if (bookmarksStore.activeFolder) {
    bookmarksStore.activeFolder.cols = currentCols.value
    bookmarksStore.activeFolder.rows = currentRows.value
    bookmarksStore.toggleShowGridDialog()
  }
}

watch(bookmarksStore.activeFolder, (newActiveFolder) => {
  currentCols.value = newActiveFolder.cols
  currentRows.value = newActiveFolder.rows
})

</script>
