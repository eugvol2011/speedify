<template>
  <q-dialog v-model="bookmarksStore.showImportDialog">
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
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useBookmarks } from '../stores/bookmarks-store'
import { ref } from 'vue'
import { validateChromeBookmarks } from '../functions/general-functions'

const q = useQuasar()
const bookmarksStore = useBookmarks()
const bookmarkHtmlString = ref(null)
const importFile = ref(null)
const embedYoutube = ref(false)
const newTab = ref(false)

let lastCoordinates = { x: 0, y: 1 }  // Object to keep track of the last coordinates

function updateCoordinates(folder) {
  lastCoordinates.x += 1;
  if (lastCoordinates.x > folder.cols) {
    lastCoordinates.x = 1;
    lastCoordinates.y += 1;
  }
}

function traverseAndAddCoordinates(root) {
  let queue = [root];  // Initialize the queue with the root node

  while (queue.length > 0) {
    let nextQueue = [];  // Prepare the next level's queue

    // Process all nodes at the current level
    for (let node of queue) {
      if (node.type === 'folder') {
        // Reset coordinates for each folder
        lastCoordinates = { x: 0, y: 1 };

        // Separate bookmarks and folders for processing
        let bookmarks = node.children.filter(child => child.type === 'bookmark');
        let folders = node.children.filter(child => child.type === 'folder');

        // Process all bookmarks in the current folder
        for (let bookmark of bookmarks) {
          updateCoordinates(node);  // Update coordinates based on the current folder
          bookmark.x = lastCoordinates.x;
          bookmark.y = lastCoordinates.y;
        }
        nextQueue.push(...folders);
      }
    }
    queue = nextQueue;
  }
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
      children,
      cols: 6,
      rows: 5
    };
  } else if (node.tagName === 'A') {
    return {
      type: "bookmark",
      name: node.textContent,
      icon: node.getAttribute('ICON'),
      url: node.getAttribute('HREF'),
      embed: embed(node.getAttribute('HREF')),
      newtab: newTab.value,
      x: 1,
      y: 1,
    };
  }
  return undefined;
}

function processFile() {
  if (!importFile.value) {
    q.notify({
      type: 'negative',
      message: `No file selected`
    })
    return;
  }
  bookmarksStore.toggleShowImportDialog()

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
              bookmarksStore.addToRootNodeChildren(parsedNode);
            }
          }
        }
      }
      traverseAndAddCoordinates(bookmarksStore.rootNode)
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
</script>
