import { defineStore } from 'pinia'

const defaultCols = 5
const defaultRows = 5
const defaultFolderIcon = "../folder.svg"

const rootNode = {
  type: "folder",
  name: "root",
  icon: defaultFolderIcon,
  screens: [
    {
      cols: defaultCols,
      rows: defaultRows,
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
    defaultFolderIcon: defaultFolderIcon,
    showGridDialog: false,
    activeFolder: rootNode,
    showEditBookmarkDialog: false,
  }),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    toggleShowImportDialog() {
      this.showImportDialog = !this.showImportDialog
    },
    addToRootNodeChildren (node) {
      this.rootNode.screens[0].children.push(node)
    },
    toggleShowGridDialog() {
      this.showGridDialog = !this.showGridDialog
    },
    setActiveFolder(folder) {
      this.activeFolder = folder
    },
    toggleShowEditBookmarkDialog() {
      this.showEditBookmarkDialog = !this.showEditBookmarkDialog
    },
  },
});
