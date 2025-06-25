<template>
  <div>
    <h2>{{ lang === 'zh' ? '收藏案件' : 'Favorites' }}</h2>
    <!-- 这里放收藏案例的内容 -->
  </div>
</template>

<script setup>
import { ref } from "vue";
const lang = ref(localStorage.getItem("lang") || "zh");
</script>