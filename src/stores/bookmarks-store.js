import { defineStore } from 'pinia'

const rootNode = {
  type: "folder",
  name: "root",
  children: [{
    type: "bookmark",
    name: "add",
    icon: '',
    url: "add",
    embed: "",
    newtab: false,
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  }],
  cols: 6,
  rows: 5
}

export const useBookmarks = defineStore({
  id: 'bookmarks',
  state: () => ({
    showImportDialog: false,
    rootNode: rootNode,
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
      this.rootNode.children.push(node)
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
