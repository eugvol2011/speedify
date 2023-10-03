<template>
  <q-item clickable @click="handleClick" :href="hrefValue" tag="a">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  },
  link: {
    type: [String, Function],
    default: '#'
  },
  icon: {
    type: String,
    default: ''
  }
});

const { title, caption, link, icon } = props;

const hrefValue = computed(() => {
  return typeof link === 'string' ? link : 'javascript:void(0)';
});

const handleClick = (event) => {
  if (typeof link === 'function') {
    event.preventDefault(); // Prevent the default navigation
    link(); // Call the function if link is a function
  }
}
</script>
