import { boot } from 'quasar/wrappers'
import UnicornLog from 'vue3-unicorn-log'

export default boot(({ app }) => {
  app.use(UnicornLog);
});
