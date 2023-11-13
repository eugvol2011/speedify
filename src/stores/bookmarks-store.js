import { defineStore } from 'pinia'
import { auth, db } from '../boot/firebase'
import { getDocs, query, where, collection, doc, updateDoc } from 'firebase/firestore'

function getInitialState() {
  const defaultCols = 5;
  const defaultRows = 5;
  const defaultMargin = 15;
  const defaultFolderIcon = "../folder.svg";
  const defaultBookmarkIcon = "../bookmark.svg";
  const defaultNoteIcon = "../note.svg";
  const defaultImportIcon = "../import.svg";
  const folderIcons = []

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
  };

  return {
    defaultCols,
    defaultRows,
    defaultMargin,
    defaultFolderIcon,
    defaultBookmarkIcon,
    defaultNoteIcon,
    defaultImportIcon,
    showImportDialog: false,
    showGridDialog: false,
    showEditBookmarkDialog: false,
    showEditFolderDialog: false,
    showEditNoteDialog: false,
    rootNode,
    activeFolder: rootNode,
    breadCrumbs: [rootNode],
    slide: "0",
    folderIcons,
  };
}


export const useBookmarks = defineStore({
  id: 'bookmarks',
  state: () => getInitialState(),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    reset() {
      console.log('reset')
      Object.assign(this, getInitialState());
    },
    toggleShowImportDialog() {
      this.showImportDialog = !this.showImportDialog
    },
    toggleShowGridDialog() {
      this.showGridDialog = !this.showGridDialog
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
    addToRootNodeChildren(node) {
      this.activeFolder.screens[+this.slide].children.push(node)
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
    getFaviconkitIcon(stringUrl) {
      if (stringUrl && stringUrl !== '') {
        return `https://marvellous-sapphire-chipmunk.faviconkit.com/${(new URL(stringUrl).host)}/256`
      } else {
        return this.defaultBookmarkIcon
      }
    },
    getGoogleIcon(stringUrl) {
      if (stringUrl && stringUrl !== '') {
        return `https://www.google.com/s2/favicons?domain=${(new URL(stringUrl).host)}&sz=256`
      } else {
        return this.defaultBookmarkIcon
      }
    },
    getAllesedvIcon(stringUrl) {
      if (stringUrl && stringUrl !== '') {
        return `https://f1.allesedv.com/256/${(new URL(stringUrl).host)}`
      } else {
        return this.defaultBookmarkIcon
      }
    },
    async fetchBookmarksContent() {
      if (auth.currentUser && auth.currentUser.email) {
        const q = query(collection(db, "users"), where("email", "==", auth.currentUser?.email))
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Assuming each user has only one document, we'll use the first document in the result.
          const docData = querySnapshot.docs[0].data();
          this.rootNode = JSON.parse(docData.bookmarksContent) || "";
          this.activeFolder = this.rootNode
          this.breadCrumbs = [this.rootNode]
        } else {
          this.bookmarksContent = "";
        }
      }
    },
    async updateBookmarksContent() {
      if (auth.currentUser && auth.currentUser.email && this.rootNode) {
        const userDoc = doc(db, "users", auth.currentUser?.email)
        console.log('for update', this.rootNode)
        try {
          await updateDoc(userDoc, {
            bookmarksContent: JSON.stringify(this.rootNode)
          })
          console.log("Bookmarks content successfully updated!");
        } catch (e) {
          console.error("Error updating document: ", e);
        }
      }
    },
    async fetchFolderIcons() {
      if (auth.currentUser && auth.currentUser.email) {
        const q = query(collection(db, "users"), where("email", "==", auth.currentUser?.email))
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Assuming each user has only one document, we'll use the first document in the result.
          const docData = querySnapshot.docs[0].data();
          this.folderIcons = docData.folderIcons || [];
        } else {
          this.folderIcons = [];
        }
      }
    },
    async updateFolderIcons() {
      if (auth.currentUser && auth.currentUser.email && this.folderIcons) {
        const userDoc = doc(db, "users", auth.currentUser?.email)
        try {
          await updateDoc(userDoc, {
            folderIcons: this.folderIcons
          })
          console.log("Folder icons successfully updated!");
        } catch (e) {
          console.error("Error updating document: ", e);
        }
      }
    },
  }
});
