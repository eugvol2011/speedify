<template>
  <q-dialog v-model="bookmarksStore.showEditFolderDialog" transition-show="slide-up" transition-hide="slide-down">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div v-if="!newItem" class="text-h6">Edit Folder</div>
        <div v-if="newItem" class="text-h6">New Folder</div>
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-md">
          <q-input v-model="tempFolder.name" label="Folder name" autofocus autoselect dense outlined rounded
            :rules="[val => (val && val.trim() !== '') || 'Folder name can\'t be empty or contain only spaces']"
            class="q-mx-sm" />

          <div class="scroll-container q-ma-xs">
            <q-icon name="chevron_left" size="md" @click="scrollLeft" v-if="shouldShowArrows" />
            <div class="folder-icons">
              <div v-for="(folderIcon, folderIconIndex) in visibleIcons"
                style="flex: 0 0 auto; align-items: start; position: relative; padding: 2px;">
                <img  :src="folderIcon" style="width: 100px; height: 100px;"
                  :class="tempFolder.icon === folderIcon ? 'active-icon' : ''"
                  @click="tempFolder.icon = folderIcon"/>
                <q-icon v-if="tempFolderIcons.indexOf(folderIcon) >= 1" @click="remove(tempFolderIcons.indexOf(folderIcon))" name="delete" size="xs"
                  style="position: absolute; top: 0; right: 0;" class="q-ma-xs" />
              </div>
            </div>
            <q-icon name="chevron_right" size="md" @click="scrollRight" v-if="shouldShowArrows" />
          </div>

          <q-uploader ref="uploader" label="Upload your folder icon" multiple batch :factory="uploadFactory" accept=".svg"
            @rejected="onRejected" no-thumbnails style="width: 100%;" class="q-mx-sm"/>
          <div class="row justify-around items-center">
            <q-btn unelevated rounded color="secondary" label="Cancel" @click="cancel" />
            <q-btn unelevated rounded color="primary" label="Apply" @click="applyEditFolderDialog" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useBookmarks } from '../stores/bookmarks-store'
import { useQuasar } from 'quasar'
import { storage } from 'boot/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db } from '../boot/firebase'
import { getDocs, query, where, collection, doc, updateDoc, arrayUnion } from 'firebase/firestore'

const bookmarksStore = useBookmarks()
const q = useQuasar()
const emit = defineEmits(['build-grid'])
const uploader = ref(null)
const scrollIndex = ref(0);

const maxVisibleItems = 6;

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

const tempFolderIcons = ref(null)
const newItem = ref(null)

const scrollLeft = () => {
  if (scrollIndex.value > 0) scrollIndex.value--;
};

const scrollRight = () => {
  if (scrollIndex.value < tempFolderIcons.value.length - maxVisibleItems) {
    scrollIndex.value++;
  }
};

const shouldShowArrows = computed(() => {
  return tempFolderIcons.value.length > maxVisibleItems;
});

watch(scrollIndex, (newIndex) => {
  // Logic to adjust the view in folder-icons div
  // This can be implemented by adjusting margin-left of the first item or similar approach
});

const visibleIcons = computed(() => {
  return tempFolderIcons.value.slice(scrollIndex.value, scrollIndex.value + maxVisibleItems);
});

const onRejected = (rejectedEntries) => {
  q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} file(s) did not pass validation constraints`
  })
}


const uploadFactory = (files) => {
  const promises = files.map(file => {
    return new Promise((resolve, reject) => {
      const fileRef = storageRef(storage, 'folder_icons/' + file.name)
      // Upload file to Firebase Storage
      uploadBytes(fileRef, file).then((snapshot) => {
        console.log('File uploaded successfully');

        // Get the download URL
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
          console.log('File available at', downloadURL)
          tempFolderIcons.value.push(downloadURL)
          //bookmarksStore.folderIcons.push(downloadURL)
          //await bookmarksStore.updateFolderIcons()
          resolve()
        });
      }).catch((error) => {
        console.error('Error uploading file:', error);
        reject()
      });
    });
  });
  uploader.value.reset()
  return Promise.all(promises);
};

const remove = (index) => {
  tempFolder.value.icon = tempFolderIcons.value[tempFolderIcons.value.indexOf(visibleIcons.value[index])-1]
  tempFolderIcons.value.splice(index, 1)
  // this removed only the link to the folder icon from folderIcons array,
  // implementation to clean storage is required,
  // considering that 2 and more links may lead to the same media file in storage
  if (scrollIndex.value !== 0) scrollIndex.value--
  //bookmarksStore.updateFolderIcons()
}

const applyEditFolderDialog = () => {
  if (tempFolder.value.name && tempFolder.value.name.trim() !== '') {
    tempFolder.value.name = tempFolder.value.name.trim()
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
    bookmarksStore.folderIcons = tempFolderIcons.value
    bookmarksStore.updateFolderIcons()
    bookmarksStore.updateBookmarksContent()
  } else {
    q.notify({
      message: 'Folder name can\'t be empty or contain only spaces',
      type: 'negative'
    })
  }
}

const editFolder = (folder, layoutItem = null) => {
  tempFolderIcons.value = [ ...bookmarksStore.folderIcons ]
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
  let index = bookmarksStore.folderIcons.indexOf(tempFolder.value.icon) - 5
  while (index < 0) {
    index++
  }
  scrollIndex.value = index
}

const cancel = () => {
  bookmarksStore.toggleShowEditFolderDialog()
  newItem.value = null
}

defineExpose({ editFolder })

</script>

<style>
.scroll-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.folder-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: calc(103px * 6 + 2px); /* Assuming each icon is 100px wide */
}
.active-icon {
  border: solid;
  border-width: 2px;
  border-color: blue;
}
</style>

