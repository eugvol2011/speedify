import { defineStore } from 'pinia'

const defaultCols = 5
const defaultRows = 5
const defaultMargin = 10
const defaultFolderIcon = "../folder.svg"
const defaultBookmarkIcon = "../bookmark.svg"
const defaultNoteIcon = "../note.svg"

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
    showGridDialog: false,
    activeFolder: rootNode,
    showEditBookmarkDialog: false,
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
      this.rootNode.screens[0].children.push(node)
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
  },
});
