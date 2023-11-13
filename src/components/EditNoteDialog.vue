<template>
  <q-dialog v-model="bookmarksStore.showEditNoteDialog" transition-show="slide-up" transition-hide="slide-down">
    <q-card style="width: 2000px; max-width: 80vw;height:1000px;">
      <q-card-section class="row items-center q-pb-none">
        <div v-if="!newItem" class="text-h6">Edit Note</div>
        <div v-if="newItem" class="text-h6">New Note</div>
      </q-card-section>

      <q-card-section>
        <q-input rounded outlined dense v-model="tempNote.name" label="Note name" />
        <quill-editor v-model:content="tempNote.content" contentType="html" :options="editorOptions" style="height: 600px;">
        </quill-editor>
      </q-card-section>
      <div class="row justify-around items-center">
        <q-btn unelevated rounded color="secondary" label="Cancel" @click="cancel" />
        <q-btn unelevated rounded color="primary" label="Save" @click="saveNote" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted, shallowRef } from 'vue'
import { useBookmarks } from '../stores/bookmarks-store'
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai-sublime.min.css'
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import BlotFormatter from 'quill-blot-formatter'
import MagicUrl from 'quill-magic-url'

Quill.register('modules/blotFormatter', BlotFormatter);
Quill.register('modules/magicUrl', MagicUrl);
Quill.debug('error')



const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
  ['link', 'image'],
  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],

  ['clean']                                         // remove formatting button
];

// Prepare your custom options for Quill
const editorOptions = {
  modules: {
    toolbar: toolbarOptions, // Add code block button to the toolbar
    syntax: {
      highlight: text => hljs.highlightAuto(text).value,
    }, // Enable the syntax module and provide the highlight.js function
    blotFormatter: {},
    magicUrl: {
      urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(tel:[\S]+)/g,
      globalRegularExpression: /(https?:\/\/|www\.|tel:)[\S]+/g,
      mailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,
      globalMailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,
    },

  },
  theme: 'snow',
  placeholder: 'Create your note here ...',
  readOnly: false,
};

const bookmarksStore = useBookmarks()
const emit = defineEmits(['build-grid'])

const tempNote = ref({
  type: "note",
  name: "New Note",
  icon: bookmarksStore.defaultNoteIcon,
  content: null,
  x: 0,
  y: 0,
})
const currentNote = ref({
  type: "note",
  name: "",
  icon: bookmarksStore.defaultNoteIcon,
  content: null,
  x: 0,
  y: 0,
})

const newItem = ref(null)


const saveNote = () => {
  bookmarksStore.toggleShowEditNoteDialog()
  if (newItem.value === null) {
    Object.assign(currentNote.value, tempNote.value)
  } else {
    tempNote.value.x = newItem.value.x
    tempNote.value.y = newItem.value.y
    bookmarksStore.activeFolder.screens[+bookmarksStore.slide].children.push(tempNote.value)
    emit('build-grid')
    newItem.value = null
  }
  bookmarksStore.updateBookmarksContent()
}

const editNote = (note, layoutItem = null) => {
  console.log('Note:', note)
  if (layoutItem === null) {
    tempNote.value = { ...note }
    bookmarksStore.toggleShowEditNoteDialog()
    currentNote.value = note
  } else {
    tempNote.value = {
      type: "note",
      name: "New Note",
      icon: bookmarksStore.defaultNoteIcon,
      content: null,
      x: 0,
      y: 0,
    }
    newItem.value = layoutItem
    bookmarksStore.toggleShowEditNoteDialog()
  }
}

const cancel = () => {
  bookmarksStore.toggleShowEditNoteDialog()
  newItem.value = null
}

defineExpose({ editNote })

</script>
