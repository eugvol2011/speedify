<template>
  <div class="bookmarks-page-wrapper justify-around" ref="bookmarksPageWrapper">
    <div class="bookmarks-container" ref="bookmarksContainer">
      <draggable-resizable-container v-show="!store.showBgModal" :grid="[gridValues[0], gridValues[1]]" :show-grid="true"
        grid-color="#000" style="width:100%; height:100%">
        <draggable-resizable-vue v-for="(bookmark, index) in bookmarksOnly" :key="index" v-model:w="gridValues[0]"
          v-model:h="gridValues[1]" :style="{left: (bookmark.x - 1) * gridValues[0] + 'px', top:(bookmark.y - 1) * gridValues[1] + 'px'}">
          <q-card class="text-white"
            style="background: transparent; background-color: rgba(0,0,0,0.3);width: 100%;height:100%;"
            @click.self="openUrl(bookmark)">

            <q-card-section class="flex column">
              <span class="flex row items-start justify-between no-wrap relative-position">
                <q-icon v-if="bookmark.type === 'bookmark' && bookmark.icon" size="sm">
                  <img :src="bookmark.icon" alt="icon" class="custom-icon" />
                </q-icon>
                <p v-if="bookmark.type === 'bookmark' && bookmark.embed === ''" class="flex-auto multiline-ellipsis">
                  {{ bookmark.name }}
                </p>
                <q-btn v-if="bookmark.type === 'bookmark'" flat icon="more_vert" @click="callEditBookmark(bookmark)"
                  style="position: absolute;right:0;top:0;padding:0 !important;z-index: 1;" />
              </span>
              <iframe allowfullscreen frameborder="0"
                v-if="bookmark.type === 'bookmark' && bookmark.embed && bookmark.embed !== ''" :src="bookmark.embed"
                :style="`position: absolute;top:0;left:0;width: ${gridValues[0]}px;height:${gridValues[1]}px;`"></iframe>
            </q-card-section>

          </q-card>
        </draggable-resizable-vue>
      </draggable-resizable-container>
    </div>

    <div v-show="!store.showBgModal" class="folders-container row justify-center items-center">
      <q-btn dense round icon="keyboard_arrow_up" color="secondary" @click="navigateUp"
        v-if="bookmarksStore.activeFolder !== bookmarksStore.rootNode" />
      <q-virtual-scroll :items="foldersOnly" virtual-scroll-item-size="50" class="q-my-md justify-center"
        virtual-scroll-horizontal>
        <template v-slot="{ item, index }">
          <div :key="index" class="folder-item">
            <q-btn size="xl" class="q-mx-md" @click="navigateToFolder(item)"
              :color="item === bookmarksStore.activeFolder ? 'blue' : 'green'">
              {{ item.name }}
            </q-btn>
          </div>
        </template>
      </q-virtual-scroll>
      <q-btn round icon="add" size="xl" color="secondary" />
    </div>

    <div v-show="!store.showBgModal" class="row justify-end">
      <q-btn class="glossy" rounded color="primary" label="Grid" @click="bookmarksStore.toggleShowGridDialog()" />
      <q-btn class="glossy" rounded color="primary" label="Import" @click="bookmarksStore.toggleShowImportDialog()" />
    </div>

    <ImportDialog />

    <GridDialog />

    <EditBookmarkDialog ref="editBookmarkDialogRef"/>

  </div>
</template>

<script setup>
import ImportDialog from '../components/ImportDialog.vue'
import GridDialog from '../components/GridDialog.vue'
import EditBookmarkDialog from '../components/EditBookmarkDialog.vue'

import { ref, computed, inject } from 'vue'
import { useGeneral } from '../stores/general-store'
import { useBookmarks } from '../stores/bookmarks-store'


import {
  DraggableResizableVue,
  DraggableResizableContainer,
} from 'draggable-resizable-vue3'




const store = useGeneral()
const bookmarksStore = useBookmarks()
const editBookmarkDialogRef = ref(null)

const callEditBookmark = (bookmark) => {
  editBookmarkDialogRef.value.editBookmark(bookmark)
}


const bookmarksContainer = ref(null)
const bookmarksPageWrapper = ref(null)
const activeSlide = ref("0");


const foldersOnly = computed(() => {
  return bookmarksStore.activeFolder.children.filter(itm => itm.type === 'folder');
});

const bookmarksOnly = computed(() => {
  return bookmarksStore.activeFolder.children.filter(item => item.type === 'bookmark')
});


function navigateToFolder(folder) {
  bookmarksStore.setActiveFolder(folder)
  activeSlide.value = "0";
}

function navigateUp() {
  if (bookmarksStore.activeFolder && bookmarksStore.activeFolder !== bookmarksStore.rootNode) {
    const parentFolder = findParentFolder(bookmarksStore.rootNode, bookmarksStore.activeFolder);
    if (parentFolder) {
      activeSlide.value = "0";
      navigateToFolder(parentFolder)
    }
  }
}

function findParentFolder(root, child) {
  for (const item of root.children) {
    if (item === child) {
      return root;
    } else if (item.type === 'folder') {
      const result = findParentFolder(item, child);
      if (result) return result;
    }
  }
  return null;
}





const openUrl = (bookmark) => {
  console.log(bookmark.newtab)
  if (bookmark.newtab) {
    window.open(bookmark.url, '_blank');
  } else {
    window.location.href = bookmark.url;
  }
}

const gridValues = computed(() => {
  if (bookmarksContainer.value && bookmarksStore.activeFolder) {
    return [
      (bookmarksContainer.value.offsetWidth - 1) / bookmarksStore.activeFolder.cols,
      (bookmarksContainer.value.offsetHeight - 1) / bookmarksStore.activeFolder.rows
    ]
  }
  else return [
    20, 20
  ]
})



</script>

<style scoped>
.bookmarks-page-wrapper {
  /*position: absolute;
  top: 0px;
  left: 0px;*/
  width: 100%;
  height: 95%;
  z-index: 0;
}

.bookmarks-container {
  width: 100%;
  height: 85%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.folders-container {
  width: 100%;
  overflow-x: auto;
}

.no-wrap {
  flex-wrap: nowrap;
}

.relative-position {
  position: relative;
}

.multiline-ellipsis {
  flex: 1;
  /* Take the maximum space between icon and button */
  margin: 0 1rem;
  /* Add some space between text and the icon/button */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 7;
  /* Number of lines you want to display */
  -webkit-box-orient: vertical;
  /*  max-height: 3.6em;*/
  /* This will depend on your line-height and the number of lines you chose in line-clamp */
}
</style>
