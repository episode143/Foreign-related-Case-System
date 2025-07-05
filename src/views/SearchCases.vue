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
          @click="doPerformSearch"
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
        <div
          class="case-list-flex"
          v-loading="loadingCases"
          element-loading-text="正在加载案件列表..."
          element-loading-spinner="Loading"
          element-loading-background="rgba(255, 255, 255, 0.8)"
        >
          <template v-if="!loadingCases && cases.length === 0">
            <div class="no-cases-message">
              {{ lang === 'zh' ? '暂无案件数据。' : 'No case data available.' }}
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, index) in cases"
              :key="item.id"
              class="case-card-new"
              :class="{ 'selected-card': index === selectIndex }"
              @click="selectCase(index)"
            >
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
          </template>
        </div>
      </el-scrollbar>
      <div style="padding: 8px 0; display: flex; justify-content: center; width: 100%">
        <el-pagination size="small" layout="prev, pager, next" :total="totalCasesCount" v-model:page-size="pageSize" v-model:current-page="page" />
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
        class="case-detail-container" style="
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
        v-loading="loadingDetail"
        element-loading-text="正在加载案件详情..."
        element-loading-spinner="Loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
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
import api from "../api/index";

export default {
  name: "SearchCases",
  setup() {
    const store = useStore();
    const lang = computed(() => store.getters.lang);
    const searchParams = computed(() => store.getters.searchParams);

    // 加载状态变量
    const loadingCases = ref(false); // 控制案件列表加载动画
    const loadingDetail = ref(false); // 控制案件详情加载动画

    // 筛选相关
    const isCollapsed = ref(true);

    const filterCountry = computed({
      get: () => searchParams.value.country,
      set: (value) => {
        store.commit("setSearchCountry", value);
      },
    });

    const filterTime = computed({
      get: () => searchParams.value.period,
      set: (value) => {
        store.commit("setSearchPeriod", value);
      },
    });

    const countryOptions = [
      { value: "", label: "全部", enLabel: "All" },
      { value: "china", label: "中国", enLabel: "China" },
      { value: "usa", label: "美国", enLabel: "USA" },
      { value: "japan", label: "日本", enLabel: "Japan" },
      { value: "korea", label: "韩国", enLabel: "Korea" },
    ];

    const cases = ref([]);
    const totalCasesCount = ref(0);
    const caseDetailContent = ref(""); // 初始值为空字符串，待加载

    const page = ref(1);
    const pageSize = ref(6);

    const searchText = computed({
      get: () => searchParams.value.keyword,
      set: (value) => {
        store.commit("setSearchKeyword", value);
      },
    });

    const performSearch = async () => {
      loadingCases.value = true; // 开始加载案件列表
      try {
        const params = {
          keyword: searchText.value,
          country: filterCountry.value,
          period: filterTime.value,
          pagenum: page.value,
          pagesize: pageSize.value,
          language: lang.value,
        };

        console.log("搜索参数", params);

        const response = await api.searchCases(params);
        console.log("API 响应:", response);

        cases.value = response.data.cases || [];
        totalCasesCount.value = response.data.totalCount || 0;

        // 搜索完成后，默认选中第一个案例并获取其摘要
        if (cases.value.length > 0) {
          // 如果当前选中索引有效且在新数据中，则保持
          // 否则，默认选中第一个
          if (selectIndex.value === -1 || selectIndex.value >= cases.value.length) {
            selectIndex.value = 0;
          }
          // getCaseSummary() 会在 selectIndex 的 watch 中触发
        } else {
          selectIndex.value = -1;
          caseDetailContent.value = lang.value === 'zh' ? "暂无案件数据。" : "No case data available.";
        }

      } catch (error) {
        console.error("搜索失败:", error);
        cases.value = [];
        totalCasesCount.value = 0;
        selectIndex.value = -1; // 确保没有选中
        caseDetailContent.value = lang.value === 'zh' ? "获取案件列表失败。" : "Failed to retrieve case list.";
      } finally {
        loadingCases.value = false; // 结束加载案件列表
      }
    };

    const getCaseSummary = async () => {
      if (selectIndex.value === -1 || !cases.value[selectIndex.value]) {
        caseDetailContent.value = lang.value === 'zh' ? "暂无详细内容。" : "No detailed content available.";
        return;
      }
      loadingDetail.value = true; // 开始加载案件详情
      try {
        const params = {
          caseId: cases.value[selectIndex.value].id,
          language: lang.value,
        };
        console.log("获取 AI 分析结果的参数", params);
        const response = await api.getCaseSummary(params);
        console.log("AI分析结果", response);
        caseDetailContent.value = response.data.content || (lang.value === 'zh' ? "未获取到 AI 分析结果。" : "No AI analysis result obtained.");
      } catch (error) {
        console.error("获取AI分析结果失败:", error);
        caseDetailContent.value = lang.value === 'zh' ? "获取 AI 分析结果失败。" : "Failed to retrieve AI analysis result.";
      } finally {
        loadingDetail.value = false; // 结束加载案件详情
      }
    };

    const doPerformSearch = () => {
      page.value = 1; // 每次点击搜索按钮时，重置页码为第一页
      performSearch();
    };

    const toggleFavorite = async (item) => {
      const params = {
        caseId: item.id,
        userId: localStorage.getItem("userId"),
      };
      console.log("收藏/取消收藏案件的参数", params);
      try {
        if (item.isfavored) {
          item.isfavored = false;
          await api.cancelFavoriteCase(params);
          console.log(`案件 ${item.case_name} (ID: ${item.id}) 已取消收藏`);
        } else {
          item.isfavored = true;
          await api.favoriteCase(params);
          console.log(`案件 ${item.case_name} (ID: ${item.id}) 已收藏`);
        }
      } catch (error) {
        console.error("收藏/取消收藏操作失败:", error);
        item.isfavored = !item.isfavored;
      }
    };

    const selectIndex = ref(-1);

    const selectCase = (index) => {
      selectIndex.value = index;
    };

    onMounted(() => {
      // 从路由参数或 Vuex store 中获取初始搜索参数
      // 可以在这里设置 initialSearch = store.getters.searchParams
      // 如果从 HomeView 跳转过来，store 已经更新了 searchParams
      // 因此直接调用 performSearch 即可，它会使用 store 中的参数
      performSearch();
    });

    watch([page, pageSize, filterCountry, filterTime], () => {
      // 这里的 watch 会在 page, pageSize, filterCountry, filterTime 任何一个变化时触发
      // doPerformSearch 已经在点击搜索按钮时重置了 page.value 为 1，所以这里不需要重复重置
      // 如果是分页器触发的 page 变化，或者筛选条件变化，这里会触发 performSearch
      performSearch();
    });

    watch(selectIndex, (newIndex) => {
      if (newIndex !== -1 && cases.value[newIndex]) {
        getCaseSummary();
      } else {
        caseDetailContent.value = lang.value === 'zh' ? "暂无详细内容。" : "No detailed content available.";
      }
    });

    watch(lang, () => {
      console.log("Language changed to:", lang.value, ". Performing new search.");
      // 语言切换时，重新执行搜索并尝试保持选中状态
      const currentSelectedCaseId = cases.value[selectIndex.value]?.id;
      performSearch().then(() => {
        // 在新数据加载后，尝试重新选中之前的案例
        if (currentSelectedCaseId) {
          const newIndex = cases.value.findIndex(c => c.id === currentSelectedCaseId);
          if (newIndex !== -1) {
            selectIndex.value = newIndex;
          } else if (cases.value.length > 0) {
            selectIndex.value = 0; // 如果之前选中的案例在新列表中不存在，则选中第一个
          } else {
            selectIndex.value = -1;
          }
        } else if (cases.value.length > 0) {
          selectIndex.value = 0; // 如果之前没有选中，则选中第一个
        } else {
          selectIndex.value = -1;
        }
      });
    });

    // 监听 cases 变化，如果当前 selectIndex 超出范围，则重置为0并尝试获取摘要
    watch(
      cases,
      (newCases) => {
        if (!newCases || newCases.length === 0) {
          selectIndex.value = -1;
          caseDetailContent.value = lang.value === 'zh' ? "暂无案件数据。" : "No detailed content available.";
        } else if (selectIndex.value === -1 || selectIndex.value >= newCases.length) {
          selectIndex.value = 0; // 默认选中第一个
        }
      },
      { immediate: true }
    );

    const md = new MarkdownIt();
    const caseDetailHtml = computed(() => {
      return md.render(caseDetailContent.value);
    });

    const downloadWord = () => {
      const selectedCase = cases.value[selectIndex.value];
      if (!selectedCase) {
        console.warn("未选择任何案例，无法下载。");
        alert(lang.value === "zh" ? "请先选择一个案件再下载。" : "Please select a case to download.");
        return;
      }

      const displayCountry = (countryOptions.find(opt => opt.value === selectedCase.country) || {})[lang.value === 'zh' ? 'label' : 'enLabel'] || selectedCase.country;

      const html = `
        <html>
          <head><meta charset="utf-8"/></head>
          <body>
            <h1>${selectedCase.case_name || (lang.value === 'zh' ? "案件详情" : "Case Details")}</h1>
            <p><strong>${lang.value === 'zh' ? "国家:" : "Country:"}</strong> ${displayCountry}</p>
            <p><strong>${lang.value === 'zh' ? "法院:" : "Court:"}</strong> ${selectedCase.court}</p>
            <p><strong>${lang.value === 'zh' ? "日期:" : "Date:"}</strong> ${selectedCase.judgement_date}</p>
            <p><strong>${lang.value === 'zh' ? "标签:" : "Tags:"}</strong> ${selectedCase.tags}</p>
            <hr/>
            ${caseDetailHtml.value}
          </body>
        </html>
      `;
      const fileName = selectedCase.case_name || (lang.value === 'zh' ? "案件详情" : "Case Details");
      const blob = HtmlDocx.asBlob(html);
      saveAs(blob, `${fileName}.docx`);
    };

    const openOriginUrl = () => {
      const selectedCase = cases.value[selectIndex.value];
      if (selectedCase && selectedCase.original_document_url) {
        window.open(selectedCase.original_document_url, "_blank");
      } else {
        console.warn("当前案件没有原始链接或未选中案件。");
        alert(lang.value === "zh" ? "当前案件没有原始链接。" : "No original link available for this case.");
      }
    };

    return {
      lang,
      isCollapsed,
      filterCountry,
      filterTime,
      countryOptions,
      cases,
      totalCasesCount,
      page,
      pageSize,
      searchText,
      selectIndex,
      selectCase,
      toggleFavorite,
      caseDetailHtml,
      doPerformSearch,
      downloadWord,
      openOriginUrl,
      performSearch,
      loadingCases, // 暴露给模板
      loadingDetail, // 暴露给模板
    };
  },
};
</script>

<style scoped>
/* 样式部分保持不变 */
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
  /* 为加载动画提供定位上下文 */
  position: relative;
  /* 确保在无数据时加载动画能完整显示 */
  min-height: 200px; /* 调整此值以适应您的布局需求 */
  align-items: center; /* 垂直居中加载动画 */
  justify-content: center; /* 水平居中加载动画 */
}

/* 当没有案件数据时显示的消息 */
.no-cases-message {
  width: 100%;
  text-align: center;
  color: #606266;
  font-size: 16px;
  margin-top: 50px;
}

/* 确保加载文本不被截断或断行 */
.case-list-flex :deep(.el-loading-text),
.case-detail-container :deep(.el-loading-text) {
  white-space: nowrap; /* 防止文本换行 */
}

.case-card-new {
  background: #f2f6fc;
  border-radius: 14px;
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s; /* 添加 border 的过渡效果 */
  width: 100%;
  min-width: 220px;
  max-width: 100%;
  height: 100px;
  margin-bottom: -2px;
  padding: 16px 24px 12px 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid rgb(221.7, 222.6, 224.4); /* 默认边框 */
}
.case-card-new.selected-card {
  border: 2px solid #409eff; /* 蓝色边框 */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2); /* 蓝色阴影 */
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
  font-size: 15px;
  color: #222;
  line-height: 1.8;
  /* 确保当内容很短时，加载动画依然能居中显示 */
  min-height: 100px; /* 根据实际内容区域大小调整 */
}

/* 案件详情容器，添加定位属性以确保 v-loading 生效 */
.case-detail-container {
  position: relative;
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