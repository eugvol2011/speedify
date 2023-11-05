import { defineStore } from 'pinia'
import { auth, db } from '../boot/firebase'
import { getDocs, query, where, collection } from 'firebase/firestore'

const defaultCols = 5
const defaultRows = 5
const defaultMargin = 10
const defaultFolderIcon = "../folder.svg"
const defaultBookmarkIcon = "../bookmark.svg"
const defaultNoteIcon = "../note.svg"
const defaultImportIcon = "../import.svg"
const defaultPasteIcon = "../paste.svg"

const rootNode = {
  type: "folder",
  name: "root",
  icon: defaultFolderIcon,
  screens: [
    {
      cols: defaultCols,
      rows: defaultRows,
      margin: defaultMargin,
      children: []
    }
  ],
  x: 0,
  y: 0,
}


export const useBookmarks = defineStore({
  id: 'bookmarks',
  state: () => ({
    showImportDialog: false,
    rootNode: rootNode,
    defaultCols: defaultCols,
    defaultRows: defaultRows,
    defaultMargin: defaultMargin,
    defaultFolderIcon: defaultFolderIcon,
    defaultBookmarkIcon: defaultBookmarkIcon,
    defaultNoteIcon: defaultNoteIcon,
    defaultImportIcon: defaultImportIcon,
    defaultPasteIcon: defaultPasteIcon,
    showGridDialog: false,
    activeFolder: rootNode,
    showEditBookmarkDialog: false,
    showEditFolderDialog: false,
    showEditNoteDialog: false,
    slide: "0",
    breadCrumbs: [rootNode]
  }),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    toggleShowImportDialog() {
      this.showImportDialog = !this.showImportDialog
    },
    addToRootNodeChildren(node) {
      //this.rootNode.screens[0].children.push(node)
      this.activeFolder.screens[+this.slide].children.push(node)
    },
    toggleShowGridDialog() {
      this.showGridDialog = !this.showGridDialog
    },
    setActiveFolder(folder) {
      this.slide = "0"
      this.activeFolder = folder
      if (this.breadCrumbs.includes(this.activeFolder)) {
        for (let i = this.breadCrumbs.indexOf(this.activeFolder); i < this.breadCrumbs.length; i++) {
          this.breadCrumbs.pop()
        }
      } else {
        this.breadCrumbs.push(this.activeFolder)
      }
    },
    toggleShowEditBookmarkDialog() {
      this.showEditBookmarkDialog = !this.showEditBookmarkDialog
    },
    toggleShowEditFolderDialog() {
      this.showEditFolderDialog = !this.showEditFolderDialog
    },
    toggleShowEditNoteDialog() {
      this.showEditNoteDialog = !this.showEditNoteDialog
    },
    createBookmarkObject(
      type,
      name,
      original_icon,
      faviconkit_icon,
      google_icon,
      icon,
      url,
      embed,
      newtab,
      x,
      y,
      w,
      h
    ) {
      return {
        type: type,
        name: name,
        original_icon: original_icon,
        faviconkit_icon: faviconkit_icon,
        google_icon: google_icon,
        icon: icon,
        url: url,
        embed: embed,
        newtab: newtab,
        x: x,
        y: y,
        w: w,
        h: h
      }
    },
    createFolderObject(
      type,
      name,
      icon,
      cols,
      rows,
      margin
    ) {
      return {
        type: type,
        name: name,
        icon: icon,
        screens: [
          {
            cols: cols,
            rows: rows,
            margin: margin,
            children: []
          }
        ],
        x: 0,
        y: 0,
      }
    },
    async fetchBookmarksContent() {
      // Define the query for the current user's background image
      const q = query(collection(db, "users"), where("email", "==", auth.currentUser?.email))
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming each user has only one document, we'll use the first document in the result.
        const docData = querySnapshot.docs[0].data();
        this.rootNode = JSON.parse(docData.bookmarksContent) || "";
        this.activeFolder = this.rootNode
        this.breadCrumbs = [this.rootNode]
        console.log('FETCHED ROOT NODE', this.rootNode)
      } else {
        this.bookmarksContent = "";
      }
    }
  },
});
