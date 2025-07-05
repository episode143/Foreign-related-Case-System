<template>
  <div class="search-grid-container">
    <div :class="['left-panel', { collapsed: isCollapsed }]">
      <button class="collapse-btn" :class="{ collapsed: isCollapsed }" @click="isCollapsed = !isCollapsed">
        <span v-if="isCollapsed">⮞</span>
        <span v-else>⮜</span>
      </button>
      <div v-show="!isCollapsed" class="panel-content">
        <h3 style="margin-bottom: 18px">{{ lang === "zh" ? "筛选" : "Filter" }}</h3>
        <div class="filter-group">
          <div class="filter-label">{{ lang === "zh" ? "国家" : "Country" }}</div>
          <select v-model="filterCountry" class="filter-select">
            <option value="">{{ lang === "zh" ? "全部" : "All" }}</option>
            <option v-for="item in countryOptions" :key="item.value" :value="item.value">
              {{ lang === "zh" ? item.label : item.enLabel }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <div class="filter-label">{{ lang === "zh" ? "判决时间" : "Judgment Time" }}</div>
          <select v-model="filterTime" class="filter-select">
            <option value="">{{ lang === "zh" ? "全部" : "All" }}</option>
            <option value="1">{{ lang === "zh" ? "最近一年" : "Last 1 year" }}</option>
            <option value="3">{{ lang === "zh" ? "最近三年" : "Last 3 years" }}</option>
            <option value="5">{{ lang === "zh" ? "最近五年" : "Last 5 years" }}</option>
            <option value="10">{{ lang === "zh" ? "最近十年" : "Last 10 years" }}</option>
          </select>
        </div>
      </div>
    </div>
    <div style="grid-area: input-area; background-color: transparent">
      <div style="width: 100%; height: 85%; background-color: white; border-radius: 15px; border: 1px solid rgb(221.7, 222.6, 224.4); position: relative">
        <button
          style="
            position: absolute;
            right: 6px;
            bottom: 5px;
            z-index: 10;
            background-color: #409eff;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
          "
          @click="performSearch"
        >
          <i class="iconfont icon-sousuo" style="font-size: 20px; color: white"></i>
        </button>
        <el-input
          class="no-border-textarea"
          v-model="searchText"
          style="padding-top: 12px; width: 100%"
          :autosize="{ minRows: 2, maxRows: 2 }"
          type="textarea"
          :placeholder="lang === 'zh' ? '请输入您想查询案件的关键字' : 'Please enter the keywords of the case you want to query'"
          @keyup.enter="performSearch"
        />
      </div>
    </div>
    <div class="case-list-area">
      <el-scrollbar style="width: 100%; height: 480px">
        <div class="case-list-flex">
          <div v-for="(item, index) in cases" :key="item.id" class="case-card-new" @click="selectCase(index)">
            <div class="case-card-content">
              <div class="case-card-header">
                <span class="case-title">{{ item.case_name }}</span>
                <i
                  class="iconfont icon-shoucang_shixin"
                  :style="{
                    marginLeft: 'auto',
                    fontSize: '20px',
                    color: item.isfavored ? '#409EFF' : 'rgb(199.5, 201, 204)',
                    cursor: 'pointer',
                  }"
                  @click.stop="toggleFavorite(item)"
                  title="收藏"
                ></i>
              </div>
              <div class="case-card-row">
                <span class="case-country">{{ item.country }}</span>
                <span class="case-court">{{ item.court }}</span>
                <span class="case-date">{{ item.judgement_date }}</span>
              </div>
              <div class="case-card-row">
                <span class="case-tags">{{ lang === "zh" ? "标签" : "Tags" }}：{{ item.tags }}</span>
                <a href="#" class="case-link">{{ lang === "zh" ? "查看" : "View" }}</a>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div style="padding: 8px 0; display: flex; justify-content: center; width: 100%">
        <el-pagination size="small" layout="prev, pager, next" :total="totalCasesCount" :page-size="searchParams.pagesize" v-model:current-page="page" />
      </div>
    </div>

    <div style="grid-area: case-content-area; background-color: transparent">
      <div
        style="
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          height: 45px;
          background-color: white;
          border: 1px solid rgb(221.7, 222.6, 224.4);
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: bold;
          padding: 0 24px;
        "
      >
        <span style="font-weight: 600; font-size: 16px; color: #409eff">
          {{ lang === "zh" ? "智能案件分析 :" : "Case Analysis :" }}
        </span>
        <span style="font-weight: 600; font-size: 16px; color: #333; margin-left: 10px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
          {{ cases[selectIndex]?.case_name || "" }}
        </span>
        <span style="font-weight: 600; font-size: 16px; color: #909399; cursor: pointer; margin-left: 24px" @click="openOriginUrl">
          {{ lang === "zh" ? "查看原始判决文书" : "View Original Judgment" }}
        </span>
        <i class="iconfont icon-xiazai" style="font-size: 16px; margin-left: 16px; color: rgb(121.3, 187.1, 255); cursor: pointer" @click="downloadWord"></i>
      </div>
      <div
        style="
          width: 100%;
          border: 1px solid rgb(221.7, 222.6, 224.4);
          border-top: none;
          height: 555px;
          background-color: white;
          border-bottom-right-radius: 10px;
          border-bottom-left-radius: 10px;
          padding: 0px 32px 0 32px;
          box-sizing: border-box;
          overflow-y: auto;
        "
      >
        <div v-html="caseDetailHtml" class="case-detail-content"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import MarkdownIt from "markdown-it";
import HtmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";
import api from "../api/index"; // 确保正确导入你的 API 模块

export default {
  name: "SearchCases",
  setup() {
    const store = useStore();
    const lang = computed(() => store.getters.lang);
    const searchParams = computed(() => store.getters.searchParams); // 获取 Vuex 中的 searchParams

    // 筛选相关
    const isCollapsed = ref(true);

    // 绑定到 Vuex 的 computed 属性
    const filterCountry = computed({
      get: () => searchParams.value.country,
      set: (value) => {
        store.commit("setSearchCountry", value);
        // 筛选条件变化时，通常会重置页码并重新搜索
        store.commit("setSearchPagenum", 1);
        performSearch();
      },
    });

    const filterTime = computed({
      get: () => searchParams.value.period,
      set: (value) => {
        store.commit("setSearchPeriod", value);
        // 筛选条件变化时，通常会重置页码并重新搜索
        store.commit("setSearchPagenum", 1);
        performSearch();
      },
    });

    const countryOptions = [
      { value: "", label: "全部", enLabel: "All" },
      { value: "china", label: "中国", enLabel: "China" },
      { value: "usa", label: "美国", enLabel: "USA" },
      { value: "uk", label: "英国", enLabel: "UK" },
      { value: "france", label: "法国", enLabel: "France" },
      { value: "japan", label: "日本", enLabel: "Japan" },
      { value: "korea", label: "韩国", enLabel: "Korea" },
      { value: "russia", label: "俄罗斯", enLabel: "Russia" },
      { value: "germany", label: "德国", enLabel: "Germany" },
    ];

    // 案例数据：此数组将只包含当前页的案例
    const cases = ref([]);
    const totalCasesCount = ref(0); // 用于分页的总数
    const caseDetailContent = ref("暂无详细内容。"); // 用于存储 AI 分析结果

    // 分页
    const page = computed({
      get: () => searchParams.value.pagenum,
      set: (value) => {
        store.commit("setSearchPagenum", value);
        performSearch(); // 页码变化触发搜索
      },
    });

    // 搜索输入框绑定到 Vuex 的 computed 属性
    const searchText = computed({
      get: () => searchParams.value.keyword,
      set: (value) => {
        store.commit("setSearchKeyword", value);
      },
    });

    // 搜索方法，触发数据获取
    const performSearch = async () => {
      try {
        // 更新 Vuex 中的搜索参数，确保页码也被设置
        store.commit("setSearchParams", {
          keyword: searchText.value,
          country: filterCountry.value,
          period: filterTime.value,
          pagenum: page.value, // 使用当前页码
          pagesize: searchParams.value.pagesize, // 保持pagesize不变
        });

        const response = await api.searchCases(searchParams.value);
        console.log("搜索参数", searchParams.value);
        // 假设 API 返回的数据结构中有 cases 数组，并且每个 case 对象有一个 isfavored 属性
        // 如果后端不返回 isfavored，你可能需要在这里手动添加或处理
        cases.value = response.data.cases || [];
        console.log("搜索结果", cases.value);
        totalCasesCount.value = response.data.totalCount || 0; // 假设 API 返回的总数

        // 搜索完成后，默认选中第一个案例并获取其摘要
        if (cases.value.length > 0) {
          selectIndex.value = 0;
          getCaseSummary(); // 立即获取第一个案例的摘要
        } else {
          selectIndex.value = -1;
          caseDetailContent.value = "暂无详细内容。"; // 清空详情内容
        }
      } catch (error) {
        console.error("搜索失败:", error);
        cases.value = []; // 如果发生错误，清空当前页数据
        totalCasesCount.value = 0; // 重置总数
        caseDetailContent.value = "获取案件列表失败。";
      }
    };

    // 获取 AI 分析结果
    const getCaseSummary = async () => {
      if (selectIndex.value === -1 || !cases.value[selectIndex.value]) {
        caseDetailContent.value = "暂无详细内容。";
        return;
      }
      try {
        const params = {
          caseId: cases.value[selectIndex.value].case_id,
          language: lang.value,
        };
        console.log("获取 AI 分析结果的参数", params);
        const response = await api.getCaseSummary(params);
        console.log("AI分析结果", response);
        caseDetailContent.value = response.data.content || "未获取到 AI 分析结果。";
      } catch (error) {
        console.error("获取AI分析结果失败:", error);
        caseDetailContent.value = "获取 AI 分析结果失败。";
      }
    };

    // **新增：收藏/取消收藏案件方法**
    const toggleFavorite = async (item) => {
      const params = {
        caseId: item.case_id,
        userId: localStorage.getItem("userId"),
      };
      console.log("收藏/取消收藏案件的参数", params);
      try {
        if (item.isfavored) {
          // 当前已收藏，点击则取消收藏
          item.isfavored = false;
          await api.cancelFavoriteCase(params);
          console.log(`案件 ${item.case_name} (ID: ${item.case_id}) 已取消收藏`);
        } else {
          // 当前未收藏，点击则收藏
          item.isfavored = true; // 更新前端状态
          await api.favoriteCase(params);
          console.log(`案件 ${item.case_name} (ID: ${item.case_id}) 已收藏`);
        }
        // 可选：在这里添加一个成功的提示消息，例如：
        // this.$message.success(lang.value === 'zh' ? '操作成功！' : 'Operation successful!');
      } catch (error) {
        console.error("收藏/取消收藏操作失败:", error);
        // 可选：在这里添加一个失败的提示消息，例如：
        // this.$message.error(lang.value === 'zh' ? '操作失败，请稍后再试。' : 'Operation failed, please try again later.');
      }
    };

    // 初始加载数据 (页面首次加载时执行搜索)
    onMounted(() => {
      performSearch();
    });

    const selectIndex = ref(0); // 默认选中第一个案例在当前页的索引

    // 处理案件卡片点击事件
    const selectCase = (index) => {
      selectIndex.value = index;
    };

    // 监听 selectIndex 变化，当选中的案例改变时，重新获取 AI 摘要
    watch(selectIndex, (newIndex) => {
      if (newIndex !== -1 && cases.value[newIndex]) {
        getCaseSummary();
      } else {
        caseDetailContent.value = "暂无详细内容。";
      }
    });

    // 监听 cases 变化，如果当前 selectIndex 超出范围，则重置为0并尝试获取摘要
    watch(
      cases,
      (newCases) => {
        if (!newCases || newCases.length === 0) {
          selectIndex.value = -1; // 如果没有案例，则重置为-1 (表示没有选中)
          caseDetailContent.value = "暂无详细内容。";
        } else if (selectIndex.value >= newCases.length || selectIndex.value === -1) {
          selectIndex.value = 0; // 如果当前索引超出新数据范围或未选中，则默认选中第一个
        }
        // 注意：这里不需要手动调用 getCaseSummary()，因为 selectIndex 的 watch 会触发
      },
      { immediate: true }
    ); // 立即执行一次，确保初始状态正确

    const caseOriginUrl = ref("https://www.courtlistener.com/opinion/4328762/mike-macmann-v-mike-matthes/?q=mike");

    const md = new MarkdownIt();
    // 根据 AI 分析结果显示其详情
    const caseDetailHtml = computed(() => md.render(caseDetailContent.value));

    const downloadWord = () => {
      const selectedCase = cases.value[selectIndex.value];
      if (!selectedCase) {
        console.warn("未选择任何案例，无法下载。");
        alert(lang.value === "zh" ? "请先选择一个案件再下载。" : "Please select a case to download.");
        return;
      }
      const html = `
        <html>
          <head><meta charset="utf-8"/></head>
          <body>
            <h1>${selectedCase.case_name || "案件详情"}</h1>
            <p><strong>国家:</strong> ${selectedCase.country}</p>
            <p><strong>法院:</strong> ${selectedCase.court}</p>
            <p><strong>日期:</strong> ${selectedCase.judgement_date}</p>
            <p><strong>标签:</strong> ${selectedCase.tags}</p>
            <hr/>
            ${caseDetailHtml.value}
          </body>
        </html>
      `;
      const blob = HtmlDocx.asBlob(html);
      saveAs(blob, `${selectedCase.case_name || "案件详情"}.docx`);
    };

    const openOriginUrl = () => {
      window.open(caseOriginUrl.value, "_blank");
    };

    return {
      lang,
      isCollapsed,
      filterCountry,
      filterTime,
      countryOptions,
      cases, // 现在 cases 存储的是当前页的数据
      totalCasesCount, // 分页总数
      page, // 页码，绑定到Vuex
      searchText, // 搜索框内容，绑定到Vuex
      selectIndex,
      selectCase, // 暴露 selectCase 方法
      toggleFavorite, // **暴露 toggleFavorite 方法**
      caseOriginUrl,
      caseDetailHtml,
      downloadWord,
      openOriginUrl,
      performSearch, // 添加搜索方法
      searchParams, // 暴露 searchParams 以便在模板中使用 pageSize
    };
  },
};
</script>

<style scoped>
.search-grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 8fr 1fr 22fr 1fr; /* 这里调整比例 */
  grid-template-rows: 20fr 100fr;
  grid-template-areas:
    "blank1 input-area blank2 case-content-area blank3"
    "blank1 case-list-area blank2 case-content-area blank3"
    "blank1 case-list-area blank2 case-content-area blank3";
}
.case-list-area {
  grid-area: case-list-area;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}
.no-border-textarea ::v-deep .el-textarea__inner {
  border: none;
  resize: none;
  background-color: transparent;
  box-shadow: none;
}
.case-list-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: flex-start;
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
}
.case-card-new {
  background: #f2f6fc;
  border-radius: 14px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  width: 100%;
  min-width: 220px;
  max-width: 100%;
  height: 100px;
  margin-bottom: -2px;
  padding: 16px 24px 12px 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.case-card-content {
  width: 100%;
}
.case-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.case-title {
  font-weight: 600;
  font-size: 16px;
  color: #222;
}
.case-card-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 2px;
}
.case-country {
  font-size: 14px;
  color: #222;
  font-weight: light;
  margin-right: 24px;
}
.case-court {
  font-size: 14px;
  color: #222;
  font-weight: light;
  margin-right: 24px;
}
.case-date {
  font-size: 14px;
  color: #222;
  font-weight: light;
  margin-left: auto;
}
.case-tags {
  font-size: 14px;
  color: #222;
  font-weight: light;
}
.case-link {
  float: right;
  color: rgb(115.2, 117.6, 122.4);
  font-size: 14px;
  font-weight: 500;
  margin-left: auto;
  text-decoration: none;
}
.case-link:hover {
  text-decoration: underline;
  color: rgb(121.3, 187.1, 255);
}
.case-detail-content {
  font-size: 15px; /* 你想要的大小 */
  color: #222;
  line-height: 1.8;
}
.left-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 93%;
  background: #fff;
  transition: left 0.3s;
  z-index: 20;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}
.left-panel.collapsed {
  left: -200px;
}
.collapse-btn {
  position: absolute;
  top: 87px;
  right: -14px;
  width: 28px;
  height: 28px;
  background: #409eff;
  color: white;
  border: 1px solid #eee;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(205, 208, 214, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 21;
  transition: right 0.3s;
}
.collapse-btn.collapsed {
  right: -14px;
}
.panel-content {
  padding: 10px 12px;
  width: 100%;
  box-sizing: border-box;
}
.filter-group {
  margin-bottom: 18px;
}
.filter-label {
  font-size: 15px;
  color: #222;
  margin-bottom: 6px;
  font-weight: 500;
}
.filter-select {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 4px;
  background: #fafbfc;
}
</style>
