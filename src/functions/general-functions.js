import { auth, db } from 'boot/firebase'
import { doc, updateDoc } from "firebase/firestore"
//import { useBookmarks } from '../stores/bookmarks-store'

//const bookmarksStore = useBookmarks()

export function validateChromeBookmarks(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Check for DOCTYPE
  const doctype = doc.doctype;
  if (!doctype || !doctype.name.startsWith("netscape-bookmark-file-")) {
    return false;
  }

  // Check for meta charset tag
  const meta = doc.querySelector("meta[http-equiv='Content-Type']");
  if (!meta || !meta.content.includes("text/html; charset=UTF-8")) {
    console.log("meta")
    return false;
  }

  // Check for title
  const title = doc.querySelector('title');
  if (!title || title.textContent !== "Bookmarks") {
    console.log("title")
    return false;
  }

  // Check for DL tag (the main container for bookmarks data)
  const dl = doc.querySelector('dl');
  if (!dl) {
    console.log("dl")
    return false;
  }

  return true;
}

