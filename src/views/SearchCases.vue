<template>
  <div class="search-grid-container">
    <div style="grid-area: input-area;background-color: transparent;">
      <div style="width: 100%; height: 85%;background-color:white;border-radius:15px;border: 2px solid rgb(177.3, 179.4, 183.6);position:relative;">
        <button style="position:absolute;right:6px;bottom:5px;z-index:10;background-color:rgb(121.3, 187.1, 255);border:none;border-radius:50%;width:30px;height:30px;display:flex;justify-content:center;align-items:center;">
          <i class="iconfont icon-sousuo" style="font-size: 20px; color: white;"></i>
        </button>
        <el-input class="no-border-textarea" v-model="textarea" style="padding-top:12px; width: 100%" :autosize="{ minRows: 2, maxRows: 2 }" type="textarea" placeholder="请输入您想查询案件的关键字" />
      </div>
    </div>
    <div style="grid-area: case-list-area; background-color: rgb(197.7, 225.9, 255)">

    </div>
    <div style="grid-area: case-content-area; background-color: rgb(197.7, 225.9, 255)">
        
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
export default {
  name: 'LoginView',
  setup() {
    const textarea = ref('');

    return {
      textarea,
    }
  }
}
</script>

<style scoped>
.search-grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 12fr 1fr 24fr 1fr;
  grid-template-rows: 20fr 100fr;
  grid-template-areas:
    "blank1 input-area blank2 case-content-area blank3"
    "blank1 case-list-area blank2 case-content-area blank3"
    "blank1 case-list-area blank2 case-content-area blank3";
}
.no-border-textarea ::v-deep .el-textarea__inner {
  border: none;
  resize: none; /* 可选：禁止手动调整大小 */
  background-color: transparent; /* 可选：去掉背景色 */
  box-shadow: none; /* 去掉 focus 状态下的阴影 */
}
</style>
