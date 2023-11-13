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
            :is-resizable="false"
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
              <!--FODLER & BOOKMARK & NOTE-->
              <div
                :style="{width: '100%', height: '15%', display: 'flex', 'align-items': 'center', 'justify-content': screen.children[item.i] ? 'space-around':'end'}">
                <div style="width:75%; display: flex; align-items: center; justify-content: space-evenly;">
                  <q-icon
                    v-if="screen.children[item.i] && hoverIndex === item.i"
                    name="edit"
                    class="tool-btn"
                    size="xs"
                    @click="handleEditClick(screen.children[item.i])"
                  />
                  <q-icon
                    v-if="screen.children[item.i] && hoverIndex === item.i"
                    name="content_cut"
                    class="tool-btn"
                    size="xs"
                    @click="handleCutClick(screen.children, item.i)"
                  />
                  <q-icon
                    v-if="screen.children[item.i] && hoverIndex === item.i"
                    name="delete"
                    class="tool-btn"
                    size="xs"
                    @click="remove(screen.children, item.i)"
                  />
                  <q-icon
                    v-if="!screen.children[item.i] && cutItem && hoverIndex === item.i"
                    @click="paste(item)"
                    class="tool-btn"
                    name="content_paste"
                    size="xs"
                  />
                </div>
                <div style="width: 15%; display:flex; justify-content: center; align-items: center;">
                  <q-icon
                    v-if="hoverIndex === item.i"
                    class="vue-draggable-handle"
                    name="more_horiz"
                    size="xs"
                  />
                </div>
              </div>
              <div
                v-if="screen.children[item.i] &&
                      (screen.children[item.i].type === 'bookmark' ||
                      screen.children[item.i].type === 'folder' ||
                      screen.children[item.i].type === 'note')"


                :class="screen.children[item.i].type"
                style="width: 100%; height:75%; display: flex; flex-direction: column; justify-content: space-evenly; align-items:center;"
              >
                <img
                  class="no-drag"
                  :src="screen.children[item.i].icon"
                  alt="icon"
                  style="width: 60%; height: 60%"
                />
                <span
                  class="no-drag"
                  style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; text-align: center; text-shadow: 2px 2px 2px rgba(0,0,0,0.5); width: 100%; line-height: 1.2em; height: 2.4em;"
                >
                  {{ screen.children[item.i].name }}
                </span>

              </div>
              <!--EMPTY ITEM-->
              <div
                v-if="screen.children[item.i] === undefined && hoverIndex === item.i"
                style="width: 100%; height:75%; display: flex; flex-direction: row; justify-content: center; align-items: center;"
              >
               <img
                 :src="bookmarksStore.defaultFolderIcon"
                 @click="callEditFolder(null, item)"
                 class="no-drag"
                 alt="newFolderIcon"
                 style="width: 25%; height: 25%"
               />
                <img
                  :src="bookmarksStore.defaultBookmarkIcon"
                  @click="callEditBookmark(null, item)"
                  class="no-drag"
                  alt="newBookmarkIcon"
                  style="width: 25%; height: 25%"
                />
                <img
                  :src="bookmarksStore.defaultNoteIcon"
                  @click="callEditNote(null, item)"
                  class="no-drag"
                  alt="newNoteIcon"
                  style="width: 25%; height: 25%"
                />
                <img
                  class="no-drag"
                  @click="openImportDialog(item)"
                  :src="bookmarksStore.defaultImportIcon"
                  alt="importIcon"
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

    <ImportDialog
      :importTo="importToItem"
      @build-grid="buildGrid()"
    />

    <GridDialog
      v-if="bookmarksStore.showGridDialog"
      @build-grid="buildGrid()"
    />

    <EditBookmarkDialog ref="editBookmarkDialogRef"
      @build-grid="buildGrid()"
    />
    <EditFolderDialog ref="editFolderDialogRef"
      @build-grid="buildGrid()"
    />
    <EditNoteDialog ref="editNoteDialogRef"
      @build-grid="buildGrid()"
    />
  </div>
</template>

<script setup>
import ImportDialog from '../components/ImportDialog.vue'
import GridDialog from '../components/GridDialog.vue'
import EditBookmarkDialog from '../components/EditBookmarkDialog.vue'
import EditFolderDialog from '../components/EditFolderDialog.vue'
import EditNoteDialog from '../components/EditNoteDialog.vue'

import { ref, reactive, onBeforeMount, inject} from 'vue'
import { useGeneral } from '../stores/general-store'
import { useBookmarks } from '../stores/bookmarks-store'

import { GridLayout, GridItem } from 'grid-layout-plus'

const $unicornLog = inject('$unicornLog')
const store = useGeneral()
const bookmarksStore = useBookmarks()

const bookmarksContainer = ref(null)
const bookmarksPageWrapper = ref(null)
const editBookmarkDialogRef = ref(null)
const editFolderDialogRef = ref(null)
const editNoteDialogRef = ref(null)
const hoverIndex = ref(null)
const showItemMenu = ref(false)
const importToItem = ref(null)
const cutItem = ref(null)
const layout = reactive([])



const hover = (i) => {
  if (showItemMenu.value===false) {
    hoverIndex.value = i
  }
}

const callEditBookmark = (bookmark, layoutItem = null) => {
  if (editBookmarkDialogRef.value) {
    editBookmarkDialogRef.value.editBookmark(bookmark, layoutItem)
  }
}

const callEditFolder = (folder, layoutItem = null) => {
  if (editFolderDialogRef.value) {
    editFolderDialogRef.value.editFolder(folder, layoutItem)
  }
}

const callEditNote = (note, layoutItem = null) => {
  if (editNoteDialogRef.value) {
    editNoteDialogRef.value.editNote(note, layoutItem)
  }
}

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
  $unicornLog({
            text: `buildGrid called, layout:`,
            disabled: store.logsOff,
            logPrefix: '[BookmarksPage.vue]',
            styles: 'color: green',
            array: layout,
          })
}


onBeforeMount(async() => {
  $unicornLog({
            text: 'onBeforeMount called',
            disabled: store.logsOff,
            logPrefix: '[BookmarksPage.vue]',
            styles: ['color: blue']
          })
  await bookmarksStore.fetchBookmarksContent()
  $unicornLog({
            text: 'Fetched bookmarksContent written to rootNode:',
            disabled: store.logsOff,
            objects: bookmarksStore.rootNode,
            logPrefix: '[BookmarksPage.vue]',
            styles: ['color: green']
          })
  await bookmarksStore.fetchFolderIcons()
  $unicornLog({
            text: 'Fetched folderIcons written to folderIcons:',
            disabled: store.logsOff,
            array: bookmarksStore.folderIcons,
            logPrefix: '[BookmarksPage.vue]',
            styles: ['color: green']
          })
  buildGrid()
})


const remove = async (array, index) => {
  array.splice(index, 1)
  buildGrid()
  showItemMenu.value = false
  await bookmarksStore.updateBookmarksContent()
}

const moved = async (screenIndex) => {
  layout.forEach((item, index) => {
    if (bookmarksStore.activeFolder.screens[screenIndex].children[index]) {
      bookmarksStore.activeFolder.screens[screenIndex].children[index].x = item.x
      bookmarksStore.activeFolder.screens[screenIndex].children[index].y = item.y
    }
  })
  console.log(layout)
  await bookmarksStore.updateBookmarksContent()
}



function navigateToFolder(folder) {
  if (folder !== bookmarksStore.activeFolder) {
    bookmarksStore.setActiveFolder(folder)
    buildGrid()
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
  if (!event.target.classList.contains('vue-draggable-handle') && !event.target.classList.contains('tool-btn')) {
    if (item !== undefined) {
      if (item.type === 'folder') {
        navigateToFolder(item)
      } else if (item.type === 'bookmark') {
        openUrl(item)
      } else if (item.type === 'note') {
        handleEditClick(item)
      }
    } else {
      console.log('EMPTY CLICKED')
    }
  }
}

const handleEditClick = (item) => {
  if (item.type === 'bookmark') {
    callEditBookmark(item)
  } else if (item.type === 'folder') {
    callEditFolder(item)
  } else if (item.type === 'note') {
    callEditNote(item)
  }
}

const handleCutClick = (array, index) => {
  cutItem.value = { ...array[index]}
  remove(array, index)
}

const paste = async (item) => {
  cutItem.value.x = item.x
  cutItem.value.y = item.y
  bookmarksStore.activeFolder.screens[+bookmarksStore.slide].children.push(cutItem.value)
  buildGrid()
  cutItem.value = null
  await bookmarksStore.updateBookmarksContent()
}

const openImportDialog = (item) => {
  importToItem.value = item
  bookmarksStore.toggleShowImportDialog()
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
