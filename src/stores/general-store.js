import { defineStore } from 'pinia'
import { auth, db } from '../boot/firebase'
import { getDocs, query, where, collection } from 'firebase/firestore'

export const useGeneral = defineStore({
  id: 'general',
  state: () => ({
    backgroundImages: [],
    currentBackgroundImage: "",
    activeIndex: 0,
    showBgModal: false,
    UNSPLASH_ACCESS_KEY: 'XTQ7lcqY76i_4ds79D-LB8oI4FF9E5M1fXzbMTE6nhk',
  }),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    addToBackgroungImages(element) {
      this.backgroundImages.push(element)
    },
    clearBackgroungImages() {
      this.backgroundImages = []
    },
    updateActiveIndex(newIndex) {
      this.activeIndex = newIndex
    },
    changeShowBgModal() {
      this.showBgModal = !this.showBgModal
    },
    async fetchBackgroundImage() {
      // Define the query for the current user's background image
      const q = query(collection(db, "users"), where("email", "==", auth.currentUser?.email))
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming each user has only one document, we'll use the first document in the result.
        const docData = querySnapshot.docs[0].data();
        this.currentBackgroundImage = docData.backgroundImage || "";  // if backgroundImage is undefined, it'll default to ""
      } else {
        this.currentBackgroundImage = "";
      }
    }
  },
});
