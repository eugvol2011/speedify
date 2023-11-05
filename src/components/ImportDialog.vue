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
import { updateBookmarksContent } from '../functions/general-functions'

const q = useQuasar()
const bookmarksStore = useBookmarks()
const bookmarkHtmlString = ref(null)
const importFile = ref(null)
const embedYoutube = ref(false)
const newTab = ref(false)
const importToItem = defineProps(['importTo'])
const emit = defineEmits(['build-grid'])

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
    const screens = [];
    if (nextSibling && nextSibling.tagName === 'DL') {
      for (const childNode of Array.from(nextSibling.children)) {
        if (childNode.tagName === 'DT') {
          const parsedChild = parseNode(childNode.firstElementChild);
          if (parsedChild) children.push(parsedChild);
        }
      }
    }

    const itemsPerScreen = bookmarksStore.defaultCols * bookmarksStore.defaultRows - 1
    const screensQty = Math.ceil(children.length / itemsPerScreen)

    for (let i = 0; i < screensQty; i++) {
      let x = 0
      let y = 0
      children.slice(i * itemsPerScreen, i * itemsPerScreen + itemsPerScreen).forEach((child) => {
        child.x = x
        child.y = y
        x++
        if (x > bookmarksStore.defaultCols - 1) {
          x = 0
          y++
        }
      })
      screens.push({
        cols: bookmarksStore.defaultCols,
        rows: bookmarksStore.defaultRows,
        margin: bookmarksStore.defaultMargin,
        children: children.slice(i * itemsPerScreen, i * itemsPerScreen + itemsPerScreen)
      })
    }

    return {
      type: "folder",
      name: node.textContent,
      icon: bookmarksStore.defaultFolderIcon,
      screens,
      x: 0,
      y: 0,
    };
  } else if (node.tagName === 'A') {
    return bookmarksStore.createBookmarkObject(
      "bookmark",
      node.textContent,
      node.getAttribute('ICON'),
      `https://marvellous-sapphire-chipmunk.faviconkit.com/${(new URL(node.getAttribute('HREF')).host)}/256`,
      `https://www.google.com/s2/favicons?domain=${(new URL(node.getAttribute('HREF')).host)}&sz=256`,
      `https://marvellous-sapphire-chipmunk.faviconkit.com/${(new URL(node.getAttribute('HREF')).host)}/256`,
      node.getAttribute('HREF'),
      embed(node.getAttribute('HREF')),
      newTab.value,
      0,
      0,
      1,
      1,
    )
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
              parsedNode.x = importToItem.importTo.x
              parsedNode.y = importToItem.importTo.y
              bookmarksStore.addToRootNodeChildren(parsedNode);
              emit('build-grid')
            }
          }
        }
      }

      console.log(bookmarksStore.rootNode)
      updateBookmarksContent()
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
