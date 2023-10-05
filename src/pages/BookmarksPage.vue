<template>
  <div class="bookmarks-page-wrapper justify-around" ref="bookmarksPageWrapper">
    <div class="bookmarks-container" ref="bookmarksContainer">
      <draggable-resizable-container v-show="!store.showBgModal" :grid="[gridValues[0], gridValues[1]]" :show-grid="true"
        grid-color="#000" style="width:100%; height:100%">
        <draggable-resizable-vue v-for="(bookmark, index) in bookmarksOnly" :key="index"
          v-model:w="gridValues[0]" v-model:h="gridValues[1]"
          >
          <q-card class="text-white" style="background: transparent; background-color: rgba(0,0,0,0.3);width: 100%;height:100%;"
            @click.self="openUrl(bookmark)">

            <q-card-section class="flex column">
              <span class="flex row items-start justify-between no-wrap relative-position">
                <q-icon v-if="bookmark.type === 'bookmark' && bookmark.icon" size="sm">
                  <img :src="bookmark.icon" alt="icon" class="custom-icon" />
                </q-icon>
                <p v-if="bookmark.type === 'bookmark' && bookmark.embed === ''" class="flex-auto multiline-ellipsis">
                  {{ bookmark.name }}
                </p>
                <q-btn v-if="bookmark.type === 'bookmark'" flat icon="more_vert" @click="editBookmark(bookmark)"
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
        v-if="currentFolder !== rootNode" />
      <q-virtual-scroll :items="foldersOnly" virtual-scroll-item-size="50" class="q-my-md justify-center"
        virtual-scroll-horizontal>
        <template v-slot="{ item, index }">
          <div :key="index" class="folder-item">
            <q-btn size="xl" class="q-mx-md" @click="navigateToFolder(item)"
              :color="item === activeFolder ? 'blue' : 'green'">
              {{ item.name }}
            </q-btn>
          </div>
        </template>
      </q-virtual-scroll>
      <q-btn round icon="add" size="xl" color="secondary" />
    </div>

    <div v-show="!store.showBgModal" class="row justify-end">
      <q-btn class="glossy" rounded color="primary" label="Import" @click="showImportDialog = true" />
    </div>

    <q-dialog v-model="showImportDialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Import from Chrome</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="column q-gutter-lg">
            <q-file clearable counter outlined accept=".html" v-model="importFile">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <q-checkbox left-label v-model="embedYoutube" label="Embed Youtube links" />
            <q-checkbox left-label v-model="newTab" label="Open all links in new tab" />
            <div class="row justify-center items-center">
              <q-btn @click="processFile" label="Import" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditBookmarkDialog" transition-show="slide-up" transition-hide="slide-down">
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
              <q-btn unelevated rounded color="secondary" label="Cancel" @click="closeEditBookmarkDialog" />
              <q-btn unelevated rounded color="primary" label="Apply" @click="applyEditBookmarkDialog" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref, computed } from 'vue'
import { useGeneral } from '../stores/general-store'
import { validateChromeBookmarks } from '../functions/general-functions'

import {
  DraggableResizableVue,
  DraggableResizableContainer,
} from 'draggable-resizable-vue3'


const q = useQuasar()

const store = useGeneral()

const importFile = ref(null)
const bookmarkHtmlString = ref(null)
const showImportDialog = ref(false)
const showEditBookmarkDialog = ref(false)
const embedYoutube = ref(false)
const newTab = ref(false)

const bookmarksContainer = ref(null)
const bookmarksPageWrapper = ref(null)

const bookmarksContainerCols = ref(5)
const bookmarksContainerRows = ref(5)

const currentBookmark = ref({
  name: '',
  type: 'bookmark',
  icon: '',
  url: '',
  embed: '',
  newtab: false,
})

const tempBookmark = ref({
  name: '',
  type: 'bookmark',
  icon: '',
  url: '',
  embed: '',
  newtab: false
})

const rootNode = ref({
  type: "folder",
  name: "root",
  children: []
});

function parseNode(node) {
  if (node.tagName === 'H3') {
    const nextSibling = node.nextElementSibling;
    const children = [];
    if (nextSibling && nextSibling.tagName === 'DL') {
      for (const childNode of Array.from(nextSibling.children)) {
        if (childNode.tagName === 'DT') {
          const parsedChild = parseNode(childNode.firstElementChild);
          if (parsedChild) children.push(parsedChild);
        }
      }
    }
    return {
      type: "folder",
      name: node.textContent,
      children
    };
  } else if (node.tagName === 'A') {
    return {
      type: "bookmark",
      name: node.textContent,
      icon: node.getAttribute('ICON'),
      url: node.getAttribute('HREF'),
      embed: embed(node.getAttribute('HREF')),
      newtab: newTab.value,
    };
  }
  return undefined;
}

function embed(href) {
  if (href) {
    const url = new URL(href)
    const params = new URLSearchParams(url.search)
    const host = url.host
    if (host === 'www.youtube.com' && embedYoutube.value) {
      return `https://www.youtube.com/embed/${params.get('v')}`
    } else return ''
  }
  return ''
}

function processFile() {
  if (!importFile.value) {
    q.notify({
      type: 'negative',
      message: `No file selected`
    })
    return;
  }
  showImportDialog.value = false

  const reader = new FileReader();
  reader.onload = (event) => {
    bookmarkHtmlString.value = event.target?.result;
    if (validateChromeBookmarks(bookmarkHtmlString.value)) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(bookmarkHtmlString.value, 'text/html');
      const mainDL = doc.querySelector('DL');
      if (mainDL) {
        for (const node of Array.from(mainDL.children)) {
          if (node.tagName === 'DT') {
            const parsedNode = parseNode(node.firstElementChild)
            if (parsedNode) {
              rootNode.value.children.push(parsedNode);
            }
          }
        }
      }
    }
    else {
      q.notify({
        type: 'negative',
        message: `It's not a Chrome bookmark file`
      })
    }
  }
  reader.readAsText(importFile.value);
}


const currentFolder = ref(rootNode.value);
const activeSlide = ref("0");
const activeFolder = ref(null);

const foldersOnly = computed(() => {
  return currentFolder.value.children.filter(itm => itm.type === 'folder');
});

const bookmarksOnly = computed(() => {
  return activeFolder?.value?.children.filter(item => item.type === 'bookmark')
});

function navigateToFolder(folder) {
  activeFolder.value = folder;
  currentFolder.value = folder;
  activeSlide.value = "0";
}

function navigateUp() {
  if (currentFolder.value && currentFolder.value !== rootNode.value) {
    const parentFolder = findParentFolder(rootNode.value, currentFolder.value);
    if (parentFolder) {
      currentFolder.value = parentFolder;
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

const editBookmark = (bookmark) => {
  tempBookmark.value = { ...bookmark }
  showEditBookmarkDialog.value = true
  currentBookmark.value = bookmark
}

const closeEditBookmarkDialog = () => {
  showEditBookmarkDialog.value = false
}

const applyEditBookmarkDialog = () => {
  showEditBookmarkDialog.value = false
  Object.assign(currentBookmark.value, tempBookmark.value)
}

const openUrl = (bookmark) => {
  if (bookmark.newtab) {
    window.open(bookmark.url, '_blank');
  } else {
    window.location.href = bookmark.url;
  }
}

const gridValues = computed(() => {
  if (bookmarksContainer.value) {
    return [
      (bookmarksContainer.value.offsetWidth - 1) / bookmarksContainerCols.value,
      (bookmarksContainer.value.offsetHeight - 1) / bookmarksContainerRows.value
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
