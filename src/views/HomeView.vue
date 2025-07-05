<template>
  <div class="home-view">
    <div style="grid-template-areas: 'favorite-cases'; display: flex; justify-content: center; align-items: center">
      <div class="favorite-cases" style="margin-bottom: 20px; background-color: transparent; width: 990px">
        <div class="section-header">
          <h3 style="font-weight: bold; display: inline-block; color: #409eff">{{ recentFavoritesText }}</h3>
        </div>
        <el-scrollbar>
          <div class="scrollbar-flex-content">
            <div v-for="caseItem in favoriteCases.slice(0, 20)" :key="caseItem.caseId" class="scrollbar-demo-item" @click="goToCaseDetail(caseItem.caseId)">
              <div style="width: 220px">
                <h4 style="font-size: 16px; color: #222; font-weight: 600; margin-bottom: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ caseItem.caseName }}</h4>
                <div style="display: flex; font-size: 14px; color: #667085; margin-bottom: 10px">
                  <span>{{ caseItem.country }} {{ caseItem.judgmentDate }}</span>
                </div>
                <div style="font-size: 14px; color: #4e5969; line-height: 1.5; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden">
                  {{ caseItem.tags }}
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <div class="search-area" style="background-color: transparent">
      <div style="width: 990px; height: 100%">
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">{{ lang === "zh" ? "国家：" : "Country:" }}</span>
            <el-radio-group v-model="filter.country" size="small">
              <el-radio-button v-for="item in countryOptions" :key="item.value" :label="item.value">{{ lang === "zh" ? item.label_zh : item.label_en }}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-group">
            <span class="filter-label">{{ lang === "zh" ? "判决时间：" : "Judgment Time:" }}</span>
            <el-radio-group v-model="filter.period" size="small">
              <el-radio-button v-for="item in timeOptions" :key="item.value" :label="item.value">{{ lang === "zh" ? item.label_zh : item.label_en }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="input-box-outer">
          <div class="input-box-inner">
            <el-input v-model="searchText" type="textarea" :autosize="{ minRows: 3, maxRows: 3 }" class="styled-textarea" :placeholder="searchPlaceholderText" />
            <button class="send-btn" @click="searchCases">
              <i class="iconfont icon-sousuo" style="font-size: 23px"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import api from "../api/index"; // 确保 api 路径正确

export default {
  name: "HomeView",
  setup() {
    const store = useStore();
    const router = useRouter();

    // filter 是一个计算属性，它会返回 store.getters.searchParams 的引用
    // 这样，el-radio-group 的 v-model="filter.country" 和 v-model="filter.time"
    // 将直接读取和反映 Vuex store 中的 searchParams.country 和 searchParams.period
    const filter = computed(() => store.getters.searchParams);

    // searchText 使用 computed 的 setter/getter 方式来实现双向绑定
    // 使得 el-input 的 v-model="searchText" 能够直接与 Vuex 的 searchParams.keyword 交互
    const searchText = computed({
      get: () => store.getters.searchParams.keyword,
      set: (value) => store.commit('setSearchKeyword', value)
    });

    const lang = computed(() => store.getters.lang);

    // 选项数据（value为后端参数，label_zh/label_en为显示文本）
    const countryOptions = [
      { value: "", label_zh: "全部", label_en: "All" },
      { value: "china", label_zh: "中国", label_en: "China" },
      { value: "usa", label_zh: "美国", label_en: "USA" },
      { value: "japan", label_zh: "日本", label_en: "Japan" },
      { value: "korea", label_zh: "韩国", label_en: "Korea" },
    ];
    const timeOptions = [
      { value: "", label_zh: "全部", label_en: "All" },
      { value: "1", label_zh: "最近一年", label_en: "Last 1 Year" },
      { value: "3", label_zh: "最近三年", label_en: "Last 3 Years" },
      { value: "5", label_zh: "最近五年", label_en: "Last 5 Years" },
      { value: "10", label_zh: "最近十年", label_en: "Last 10 Years" },
    ];

    const recentFavoritesText = computed(() => {
      return lang.value === "zh" ? "最近收藏案件" : "Recently Favorited Cases";
    });

    const searchPlaceholderText = computed(() => {
      return lang.value === "zh" ? "请输入您想查询案件的关键字，可输入案件名称、当事人、案号等" : "Enter keywords to search for cases, such as case names, parties, case numbers, etc.";
    });

    const favoriteCases = ref([]);

    const getCollectionList = async () => {
      try {
        const params = {
          userId: localStorage.getItem('userId'), // 假设用户ID存储在localStorage中
          language: store.getters.lang, // 使用Vuex中的语言设置
        };
        console.log("获取收藏列表参数:", params); // 打印获取收藏列表的参数
        const response = await api.getCollectionList(params);
        if (response.code === 200) { // 检查响应状态码是否为200
          favoriteCases.value = response.data; // 更新收藏案件数据
        } else {
          console.error("获取收藏列表失败:", response.message); // 打印错误信息
        }
      } catch (error) {
        console.error("获取收藏列表时发生错误:", error); // 捕获并打印错误
      }
    };

    // 搜索案件
    const searchCases = () => {
      // 在点击搜索按钮时，通过 mutation 更新 Vuex 中的搜索参数
      // 这会触发 Vuex store 中的 state 更新，然后相应的 getter 会返回最新值
      store.commit("setSearchParams", {
        keyword: searchText.value, // 使用计算属性 searchText 的值
        country: filter.value.country, // filter.value.country 已经同步到 Vuex state
        period: filter.value.period, // 'time' 对应后端 API 的 'period'，filter.value.time 已经同步到 Vuex state
        pagenum: 1, // 搜索时默认回到第一页
        pagesize: 6, // 每页大小默认为6
      });

      // 执行搜索逻辑，导航到搜索结果页
      // /case-query/search 页面可以通过 store.getters.searchParams 获取最新的搜索条件
      router.push("/case-query/search");
    };

    // 跳转到案件详情（收藏详情）
    const goToCaseDetail = (caseId) => {
      router.push({ path: "/case-query/favorite", query: { caseId: caseId } });
    };

    onMounted(() => {
      // 页面加载时获取收藏列表
      getCollectionList();

      // 在组件挂载时，如果需要，可以将 Vuex 中保存的搜索参数回填到组件的本地状态或表单元素中。
      // 但由于现在 filter 和 searchText 已经是 computed 属性直接绑定到 Vuex，
      // 这一步在 V-model 的 Get 方法中已经隐式完成。
    });

    // 监听语言变化，重新获取收藏列表
    watch(lang, () => {
      getCollectionList();
    });

    // 监听 filter.country 变化，并同步到 Vuex 的 searchParams.country
    watch(() => filter.value.country, (newVal) => {
      store.commit('setSearchCountry', newVal);
    });

    // 监听 filter.time 变化，并同步到 Vuex 的 searchParams.period
    // 注意：这里的 filter.time 对应 Vuex 中的 period 字段
    watch(() => filter.value.time, (newVal) => {
      store.commit('setSearchPeriod', newVal);
    });

    return {
      searchText,
      filter,
      favoriteCases,
      searchCases,
      goToCaseDetail,
      recentFavoritesText,
      searchPlaceholderText,
      lang,
      countryOptions,
      timeOptions,
    };
  },
};
</script>

<style scoped>
.home-view {
  padding: 20px;
  display: flex;
  display: grid;
  grid-template-areas:
    "favorite-cases"
    "search-area";
  grid-template-rows: 250px 300px;
  font-size: 14px; /* 新增，设置全局最小字体 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px; /* 可选，标题更大 */
}

.case-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.search-area {
  background: transparent;
  padding: 72px 0 0 0; /* 原为40px，改为72px，整体下移32px */
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 18px;
  justify-content: flex-start;
  width: 100%;
  max-width: 1100px;
  font-size: 14px; /* 新增 */
}
.filter-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  white-space: nowrap; /* 防止label换行 */
}
.filter-label {
  font-weight: 500;
  color: #667085;
  margin-right: 8px; /* 调小间距，避免被挤压 */
  font-size: 15px;
  white-space: nowrap; /* 防止label换行 */
}
.input-box-outer {
  width: 100%;
  max-width: 1100px;
  display: flex;
  justify-content: center;
}
.input-box-inner {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 0 0 2px #e0e6f7;
  padding: 0;
  display: flex;
  align-items: flex-end;
  transition: box-shadow 0.2s;
  font-size: 14px; /* 新增 */
}
.styled-textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 16px;
  padding: 24px 60px 24px 24px;
  border-radius: 18px;
  outline: none;
  resize: none;
  box-shadow: none;
}
/* 注意：Vue 3 推荐使用 :deep() 或 ::v-deep() 而不是 /deep/ */
/* 但对于 El-Element 组件的样式穿透，::v-deep() 通常仍然有效 */
.styled-textarea ::v-deep .el-textarea__inner {
  border: none !important;
  background: transparent !important;
  font-size: 16px;
  padding: 24px 60px 24px 24px;
  border-radius: 18px;
  outline: none;
  resize: none;
  box-shadow: none;
}
.send-btn {
  position: absolute;
  right: 18px;
  bottom: 18px;
  background: #3a8ee6;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  transition: background 0.2s;
}
.send-btn:hover {
  background: #409eff;
}

/* 横向滚动条样式 */
.scrollbar-flex-content {
  display: flex;
  width: fit-content;
  font-size: 14px; /* 新增 */
}
.scrollbar-demo-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240px;
  height: 120px;
  margin: 10px 10px 10px 0;
  text-align: left;
  border-radius: 8px;
  background: #f2f6fc;
  color: #222;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: box-shadow 0.2s;
  font-size: 14px; /* 新增 */
}
.scrollbar-demo-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 统一筛选区字体为14px */
.filter-bar,
.filter-group,
.filter-label,
.el-radio-button__inner,
.el-select,
.el-select__input,
.el-select__selected-item,
.el-select-dropdown__item {
  font-size: 16px !important;
}
.filter-label {
  font-weight: 600;
}
</style>