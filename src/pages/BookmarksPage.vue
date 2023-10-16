<template>
  <div class="bookmarks-page-wrapper justify-around" ref="bookmarksPageWrapper">
    <div class="bookmarks-container" ref="bookmarksContainer">

      <q-carousel v-show="!store.showBgModal" v-model="slide" transition-prev="scale" transition-next="scale" swipeable
        animated control-color="white" navigation padding arrows height="100%"
        class="bg-primary text-white shadow-1 rounded-borders"
        @transition="buildGrid()"
        style="background-color: transparent !important;">
        <q-carousel-slide v-for="(screen, screenIndex) in bookmarksStore.activeFolder.screens" :key="screenIndex"
          :name="`${screenIndex}`">
          <GridLayout v-if="bookmarksContainer" v-model:layout="layout"
            :row-height="bookmarksContainer.offsetHeight / screen.rows * 0.9" :col-num="screen.cols" is-draggable
            is-resizable vertical-compact use-css-transforms
            :is-bounded="true">
            <GridItem v-for="item in layout" :key="item.i" :i="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h"
              @moved="moved(screenIndex)" is-draggable is-resizable>
              <div @dblclick="navigateToFolder(screen.children[item.i])" class="folder"
                style="width: 100%; height:100%; display: flex; flex-direction: column; justify-content: center; align-items: center;"
                v-if="screen.children[item.i] && screen.children[item.i].type === 'folder'">
                <img class="icon" :src="screen.children[item.i].icon" alt="icon" style="width: 70%; height: 70%" />
                {{ screen.children[item.i].name }}
              </div>
              <div @click="openUrl(screen.children[item.i].url)" class="bookmark"
                style="width: 100%; height:100%; display: flex; flex-direction: column; justify-content: center; align-items: center;"
                v-if="screen.children[item.i] && screen.children[item.i].type === 'bookmark'">
                <img :src="screen.children[item.i].icon" alt="icon" style="width: 70%; height: 70%" />
                {{ screen.children[item.i].name }}
              </div>
            </GridItem>
          </GridLayout>


        </q-carousel-slide>
      </q-carousel>

    </div>

    <div v-show="!store.showBgModal" class="folders-container row justify-center items-center">
      <q-btn dense round icon="keyboard_arrow_up" color="secondary" @click="navigateUp"
        v-if="bookmarksStore.activeFolder !== bookmarksStore.rootNode" />
    </div>

    <div v-show="!store.showBgModal" class="row justify-end">
      <q-btn class="glossy" rounded color="primary" label="Grid" @click="bookmarksStore.toggleShowGridDialog()" />
      <q-btn class="glossy" rounded color="primary" label="Import" @click="bookmarksStore.toggleShowImportDialog()" />
    </div>

    <ImportDialog />

    <GridDialog />

    <EditBookmarkDialog ref="editBookmarkDialogRef" />

  </div>
</template>

<script setup>
import ImportDialog from '../components/ImportDialog.vue'
import GridDialog from '../components/GridDialog.vue'
import EditBookmarkDialog from '../components/EditBookmarkDialog.vue'

import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useGeneral } from '../stores/general-store'
import { useBookmarks } from '../stores/bookmarks-store'


import { GridLayout, GridItem } from 'grid-layout-plus'




const store = useGeneral()
const bookmarksStore = useBookmarks()
const editBookmarkDialogRef = ref(null)
const slide = ref("0")


const callEditBookmark = (bookmark) => {
  editBookmarkDialogRef.value.editBookmark(bookmark)
}


const bookmarksContainer = ref(null)
const bookmarksPageWrapper = ref(null)


const layout = reactive([])

function buildGrid() {
  layout.length = 0
  bookmarksStore.activeFolder.screens[+slide.value].children.forEach((item, index) => {
    layout.push({ x: item.x, y: item.y, w: 1, h: 1, i: index, static: false })
  })
  function fillGrid(layout, cols, rows) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!layout.some(item => item.x === x && item.y === y)) {
          layout.push({ x: x, y: y, w: 1, h: 1, i: layout.length, static: false });
        }
      }
    }
  }
  fillGrid(layout, bookmarksStore.activeFolder.screens[0].cols, bookmarksStore.activeFolder.screens[0].rows)
  console.log('Layout:',layout)
}

onMounted(() => {
  buildGrid()
})


const moved = (screenIndex) => {
  layout.forEach((item, index) => {
    if (bookmarksStore.activeFolder.screens[screenIndex].children[index]) {
      bookmarksStore.activeFolder.screens[screenIndex].children[index].x = item.x
      bookmarksStore.activeFolder.screens[screenIndex].children[index].y = item.y
    }
  })
  //buildGrid()
  console.log(layout)
}





function navigateToFolder(folder) {
  bookmarksStore.setActiveFolder(folder)
  slide.value = "0"
  buildGrid()
}

function navigateUp() {
  if (bookmarksStore.activeFolder && bookmarksStore.activeFolder !== bookmarksStore.rootNode) {
    const parentFolder = findParentFolder(bookmarksStore.rootNode, bookmarksStore.activeFolder);
    //console.log('PARENT FOLDER:', parentFolder.name)
    if (parentFolder) {
      navigateToFolder(parentFolder)
    }
  }
}

function findParentFolder(root, child) {
  let result = null;
  let searchInside = (root, child) => {
    let parent = root;
    let screens = root.screens;
    function searchParent(screens, child) {
      for (let i = 0; i < screens.length; i++) {
        let screen = screens[i];
        for (let j = 0; j < screen.children.length; j++) {
          let item = screen.children[j];
          if (item === child) {
            //console.log('PARENT FOLDER FROM INSIDE:', parent.name);
            result = parent;
            return;
          } else {
            let foldersOnly = screen.children.filter(item => item.type === 'folder');
            for (let k = 0; k < foldersOnly.length; k++) {
              let folder = foldersOnly[k];
              if (result === null) {
                searchInside(folder, child);
              }
            }
          }
          if (result !== null) {
            return;
          }
        }
        if (result !== null) {
          return;
        }
      }
    }
    searchParent(screens, child)
  }
  searchInside(root, child)
  return result;
}





const openUrl = (bookmark) => {
  /*
   if (bookmark.newtab) {
     window.open(bookmark.url, '_blank');
   } else {
     window.location.href = bookmark.url;
   }
   */
}

const gridValues = computed(() => {
  if (bookmarksContainer.value && bookmarksStore.activeFolder) {
    return [
      bookmarksContainer.value.offsetWidth / bookmarksStore.activeFolder.cols,
      bookmarksContainer.value.offsetHeight / bookmarksStore.activeFolder.rows
    ]
  }
  else return [
    20, 20
  ]
})



</script>

<style scoped>
.vgl-layout {
  background-color: transparent;
}

:deep(.vgl-item:not(.vgl-item--placeholder)) {
  background-color: transparent;
  border: none;
}

:deep(.vgl-item:not(.vgl-item--placeholder)):hover {
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid black;
}

:deep(.vgl-item--resizing) {
  opacity: 90%;
}

:deep(.vgl-item--static) {
  background-color: #cce;
}

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
  /*display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;*/
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
