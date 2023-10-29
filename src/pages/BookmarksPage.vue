<template>
  <div class="bookmarks-page-wrapper justify-around" ref="bookmarksPageWrapper">
    <div class="bookmarks-container" ref="bookmarksContainer">
      <q-carousel
        v-show="!store.showBgModal"
        v-model="bookmarksStore.slide"
        @transition="buildGrid()"
        class="bg-primary text-white shadow-1 rounded-borders"
        control-color="white"
        height="100%"
        style="background-color: transparent !important;"
        transition-next="scale"
        transition-prev="scale"
        animated
        arrows
        navigation
        padding
        swipeable
      >
        <q-carousel-slide
          v-for="(screen, screenIndex) in bookmarksStore.activeFolder.screens"
          :key="screenIndex"
          :name="`${screenIndex}`"
          style="background-color: transparent; padding-top: 0; padding-bottom: 0; height: 100%;"
        >
          <GridLayout
            v-if="bookmarksContainer"
            v-model:layout="layout"
            :col-num="screen.cols"
            :is-bounded="true"
            :margin="[bookmarksStore.defaultMargin, bookmarksStore.defaultMargin]"
            :max-rows="screen.rows"
            :row-height="bookmarksContainer.offsetHeight / screen.rows - screen.margin - screen.margin / screen.rows"
          >
            <GridItem
              v-for="item in layout"
              :key="item.i"
              :h="item.h"
              :i="item.i"
              :w="item.w"
              :x="item.x"
              :y="item.y"
              @moved="moved(screenIndex)"
              @click="handleItemClick(screen.children[item.i], $event)"
              @mouseleave="hover(null)"
              @mouseover="hover(item.i)"
              drag-allow-from=".vue-draggable-handle"
              drag-ignore-from=".no-drag"
            >
              <!--FODLER & BOOKMARK-->
              <div
                v-if="screen.children[item.i] &&
                      (screen.children[item.i].type === 'bookmark' ||
                      screen.children[item.i].type === 'folder')"


                :class="screen.children[item.i].type"
                style="width: 100%; height:100%; display: flex; flex-direction: column; justify-content: center; align-items: center;"
              >
                <img
                  class="no-drag"
                  :src="screen.children[item.i].icon"
                  alt="icon"
                  style="width: 60%; height: 60%"
                />
                <span
                  class="no-drag"
                  :style="hoverIndex === item.i ?
                  { 'background-color': 'transparent' } :
                  { 'background-color': 'rgba(0, 0, 0, 0.5)', 'border-radius': '10%'}">
                  {{ screen.children[item.i].name }}
                </span>
                <q-icon
                  v-if="hoverIndex === item.i"
                  class="vue-draggable-handle"
                  name="more_vert"
                  size="md"
                  style="position: absolute; top: 0; right: 0;"
                >
                  <q-menu
                    v-model="showItemMenu"
                    transition-hide="scale"
                    transition-show="scale"
                    auto-close
                    fit
                    context-menu
                    class="bg-black text-white"
                  >
                    <q-list dense>
                      <q-item clickable>
                        <q-item-section
                          @click="handleEditClick(screen.children[item.i])">Edit</q-item-section
                        >
                      </q-item>
                      <q-item clickable>
                        <q-item-section>Move</q-item-section>
                      </q-item>
                      <q-item clickable>
                        <q-item-section
                          @click="remove(screen.children, item.i)">Remove</q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-icon>
              </div>
              <!--EMPTY ITEM-->
              <div
                v-if="screen.children[item.i] === undefined && hoverIndex === item.i"
                style="width: 100%; height:100%; display: flex; flex-direction: row; justify-content: center; align-items: center;"
              >
                <img
                  class="no-drag"
                  :src="bookmarksStore.defaultFolderIcon"
                  alt="newFolderIcon"
                  style="width: 25%; height: 25%"
                />
                <img
                  class="no-drag"
                  :src="bookmarksStore.defaultBookmarkIcon"
                  alt="newBookmarkIcon"
                  style="width: 25%; height: 25%"
                />
                <img
                  class="no-drag"
                  :src="bookmarksStore.defaultNoteIcon"
                  alt="newNoteIcon"
                  style="width: 25%; height: 25%"
                />
              </div>
            </GridItem>
          </GridLayout>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <div
      v-show="!store.showBgModal"
      class="row justify-start items-center q-gutter-x-md q-px-lg"
      style="background-color: rgba(0, 0, 0, 0.5);"
    >
      <q-btn
        @click="bookmarksStore.toggleShowGridDialog()"
        class="glossy"
        color="primary"
        label="Grid"
        rounded
      />
      <q-btn
        @click="bookmarksStore.toggleShowImportDialog()"
        class="glossy"
        color="primary"
        label="Import"
        rounded
      />
      <q-btn
        v-if="bookmarksStore.activeFolder !== bookmarksStore.rootNode"
        @click="navigateUp"
        color="secondary"
        icon="keyboard_arrow_up"
        dense
        round
      />
      <q-breadcrumbs active-color="white">
        <q-breadcrumbs-el
          v-for="crumb in bookmarksStore.breadCrumbs"
          :label="crumb.name"
          @click="navigateToFolder(crumb)"
          style="font-size: 20px; color:aqua;"
        />
      </q-breadcrumbs>
    </div>

    <ImportDialog />

    <GridDialog
      v-if="bookmarksStore.showGridDialog"
      @build-grid="buildGrid()"
    />

    <EditBookmarkDialog ref="editBookmarkDialogRef" />
  </div>
</template>

<script setup>
import ImportDialog from '../components/ImportDialog.vue'
import GridDialog from '../components/GridDialog.vue'
import EditBookmarkDialog from '../components/EditBookmarkDialog.vue'

import { ref, computed, reactive, watch, onMounted} from 'vue'
import { useGeneral } from '../stores/general-store'
import { useBookmarks } from '../stores/bookmarks-store'


import { GridLayout, GridItem } from 'grid-layout-plus'




const store = useGeneral()
const bookmarksStore = useBookmarks()
const editBookmarkDialogRef = ref(null)
const hoverIndex = ref(null)
const hover = (i) => {
  if (showItemMenu.value===false) {
    hoverIndex.value = i
  }
}
const showItemMenu = ref(false)


const callEditBookmark = (bookmark) => {
  if (editBookmarkDialogRef.value) {
    editBookmarkDialogRef.value.editBookmark(bookmark)
  }
}


const bookmarksContainer = ref(null)
const bookmarksPageWrapper = ref(null)


const layout = reactive([])

function buildGrid() {
  layout.length = 0
  bookmarksStore.activeFolder.screens[+bookmarksStore.slide].children.forEach((item, index) => {
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
  fillGrid(layout, bookmarksStore.activeFolder.screens[+bookmarksStore.slide].cols, bookmarksStore.activeFolder.screens[+bookmarksStore.slide].rows)
  console.log('Layout:', layout)
}

onMounted(() => {
  buildGrid()
})


const remove = (array, index) => {
  array[index] = bookmarksStore.createBookmarkObject(
    "removed",
    "removed",
    "",
    "",
    "",
    "",
    "",
    "",
    false,
    array[index].x,
    array[index].y,
    1,
    1
  )
  showItemMenu.value = false
}

const moved = (screenIndex) => {
  layout.forEach((item, index) => {
    if (bookmarksStore.activeFolder.screens[screenIndex].children[index]) {
      bookmarksStore.activeFolder.screens[screenIndex].children[index].x = item.x
      bookmarksStore.activeFolder.screens[screenIndex].children[index].y = item.y
    }
  })
  console.log(layout)
}



function navigateToFolder(folder) {
  if (folder !== bookmarksStore.activeFolder) {
    let currentFolder = bookmarksStore.activeFolder
    bookmarksStore.setActiveFolder(folder)
    buildGrid()
    currentFolder.screens.forEach((screen) => {
      screen.children = screen.children.filter(item => item.type !== 'removed')
    })
    console.log(currentFolder)
  }
}

function navigateUp() {
  if (bookmarksStore.activeFolder && bookmarksStore.activeFolder !== bookmarksStore.rootNode) {
    const parentFolder = findParentFolder(bookmarksStore.rootNode, bookmarksStore.activeFolder);
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
   if (bookmark.newtab) {
     window.open(bookmark.url, '_blank');
   } else {
     window.location.href = bookmark.url;
   }
}


const handleItemClick = (item, event) => {
  if (!event.target.classList.contains('vue-draggable-handle')) {
    if (item !== undefined && item.type !== 'removed') {
      if (item.type === 'folder') {
        navigateToFolder(item)
      } else if (item.type === 'bookmark') {
        openUrl(item)
      }
    } else {
      console.log('EMPTY CLICKED')
    }
  }
}

const handleEditClick = (item) => {
  if (item.type === 'bookmark') {
    callEditBookmark(item)
  }
}

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
  border-radius: 10%;
}

:deep(.vgl-item--resizing) {
  opacity: 90%;
}

:deep(.vgl-item--static) {
  background-color: #cce;
}

.bookmarks-page-wrapper {
  width: 100%;
  height: 95%;
  z-index: 0;
}

.bookmarks-container {
  width: 100%;
  height: 96%;
  /*display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;*/
  overflow: auto;
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
