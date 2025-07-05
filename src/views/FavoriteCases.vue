<template>
  <div class="search-grid-container">
    <div :class="['left-panel', { collapsed: isCollapsed }]">
      <button class="collapse-btn" :class="{ collapsed: isCollapsed }" @click="isCollapsed = !isCollapsed">
        <span v-if="isCollapsed">⮞</span>
        <span v-else>⮜</span>
      </button>
      <div v-show="!isCollapsed" class="panel-content">
        <h3 style="margin-bottom:18px;">{{ lang === 'zh' ? '收藏夹' : 'Favorites' }}</h3>
        <div class="filter-group">
          <div class="filter-label">{{ lang === 'zh' ? '国家' : 'Country' }}</div>
          <select v-model="filterCountry" class="filter-select">
            <option value="">{{ lang === 'zh' ? '全部' : 'All' }}</option>
            <option v-for="item in countryOptions" :key="item.value" :value="item.value">
              {{ lang === 'zh' ? item.label : item.enLabel }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <div class="filter-label">{{ lang === 'zh' ? '判决时间' : 'Judgment Time' }}</div>
          <select v-model="filterTime" class="filter-select">
            <option value="">{{ lang === 'zh' ? '全部' : 'All' }}</option>
            <option value="1">{{ lang === 'zh' ? '最近一年' : 'Last 1 year' }}</option>
            <option value="3">{{ lang === 'zh' ? '最近三年' : 'Last 3 years' }}</option>
            <option value="5">{{ lang === 'zh' ? '最近五年' : 'Last 5 years' }}</option>
            <option value="10">{{ lang === 'zh' ? '最近十年' : 'Last 10 years' }}</option>
          </select>
        </div>
        <div class="filter-group">
          <div class="filter-label">{{ lang === 'zh' ? '提示' : 'Tips' }}</div>
          <div style="color:#888;font-size:13px;">
            {{ lang === 'zh' ? '点击右侧卡片可查看详情，点击星星可取消收藏。' : 'Click the card to view details, click the star to unfavorite.' }}
          </div>
        </div>
      </div>
    </div>
    <div style="grid-area: input-area; background-color: transparent"></div>
    <div class="case-list-area">
      <el-scrollbar style="width: 100%; height: 590px">
        <div class="case-list-flex">
          <div
            v-for="(item, index) in cases"
            :key="item.case_id"
            class="case-card-new"
            @click="selectCase(index)"
            :class="{ 'selected-card': index === selectIndex }"
          >
            <div class="case-card-content">
              <div class="case-card-header">
                <span class="case-title">{{ item.case_name }}</span>
                <i
                  class="iconfont icon-shoucang_shixin"
                  :style="{
                    marginLeft: 'auto',
                    fontSize: '20px',
                    color: '#409EFF',
                    cursor: 'pointer'
                  }"
                  @click.stop="unFavorite(item.case_id)"
                  title="取消收藏"
                ></i>
              </div>
              <div class="case-card-row">
                <span class="case-country">
                  {{
                    item.country
                  }}
                </span>
                <span class="case-court">{{ item.court || (lang === 'zh' ? '未知法院' : 'Unknown Court') }}</span> 
                <span class="case-date">{{ item.judgement_date }}</span>
              </div>
              <div class="case-card-row">
                <span class="case-tags">
                  {{ lang === "zh" ? "类型" : "Tags" }}：
                  {{ item.tags || (lang === 'zh' ? '暂无标签' : 'No Tags') }}
                </span>
                <a href="#" class="case-link" @click.prevent="selectCase(index)">{{ lang === "zh" ? "查看" : "View" }}</a>
              </div>
            </div>
          </div>
          <div v-if="cases.length === 0 && !loading" class="no-cases-message">
            {{ lang === 'zh' ? '暂无收藏案件。' : 'No favorite cases found.' }}
          </div>
          <div v-if="loading" class="loading-message">
            {{ lang === 'zh' ? '加载中...' : 'Loading...' }}
          </div>
        </div>
      </el-scrollbar>
      <div style="padding: 8px 0; display: flex; justify-content: center; width: 100%">
        <el-pagination
          size="small"
          layout="prev, pager, next"
          :total="totalCasesCount"
          v-model:page-size="pageSize"
          v-model:current-page="page"
        />
      </div>
    </div>
    <div style="grid-area: case-content-area;background-color: transparent;">
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
        <span style="font-weight: 600; font-size: 16px; color: #409eff;">
          {{ lang === "zh" ? "智能案件分析 :" : "Case Analysis :" }}
        </span>
        <span style="font-weight: 600; font-size: 16px; color: #333; margin-left: 10px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {{ cases[selectIndex]?.case_name || (lang === 'zh' ? '请选择案件' : 'Please select a case') }}
        </span>
        <span
          style="font-weight: 600; font-size: 16px; color: #909399; cursor: pointer; margin-left: 24px;"
          @click="openOriginUrl"
        >
          {{ lang === "zh" ? "查看原始判决文书" : "View Original Judgment" }}
        </span>
        <i
          class="iconfont icon-xiazai"
          style="font-size: 16px; margin-left: 16px; color: rgb(121.3, 187.1, 255); cursor: pointer;"
          @click="downloadWord"
        ></i>
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
import MarkdownIt from "markdown-it";
import HtmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";
import { useStore } from "vuex";
import api from "../api/index"; // 确保你有一个 api 模块来处理后端请求

export default {
  name: "FavoriteCases",
  setup() {
    // ==============================
    // 1. 状态管理变量
    // ==============================
    const store = useStore();
    const lang = computed(() => store.getters.lang);
    const favoriteSearchParams = store.getters.favoriteSearchParams; // 从 Vuex 获取收藏夹搜索参数，用于初始值

    // 布局控制状态
    const isCollapsed = ref(true);
    
    // 收藏案例数据和总数
    const cases = ref([]); // 将不再是mock数据，而是通过API获取
    const totalCasesCount = ref(0); // 从后端获取的总数
    const loading = ref(false); // 加载状态

    // 分页状态 (现在是本地 ref，从 Vuex 获取初始值)
    const page = ref(favoriteSearchParams.pagenum || 1);
    const pageSize = ref(5); // 页面中设置为5，这是固定的

    // 选中案例的索引 (现在是本地 ref，从 Vuex 获取初始值)
    const selectIndex = ref(favoriteSearchParams.selectedIndex || -1);
    const selectCaseId = computed(() => {
      if(selectIndex.value === -1 || !cases.value[selectIndex.value]) {
        return null; // 如果没有选中案例，返回 null
      } else {
        return cases.value[selectIndex.value].case_id; // 返回选中案例的 ID
      }
    });
    // 筛选状态 (现在是本地 ref，从 Vuex 获取初始值)
    const filterCountry = ref("");
    const filterTime = ref("");

    // ==============================
    // 2. 配置数据
    // ==============================
    // 国家选项 (扩展以匹配更广泛的数据)
    const countryOptions = [
      { value: "", label: "全部", enLabel: "All" },
      { value: "中国", label: "中国", enLabel: "China" },
      { value: "美国", label: "美国", enLabel: "USA" },
      { value: "日本", label: "日本", enLabel: "Japan" },
      { value: "韩国", label: "韩国", enLabel: "Korea" },
    ];

    const caseDetailContent = ref(""); // 用于存储 AI 分析结果，初始为空

    // Markdown 处理器
    const md = new MarkdownIt();

    // 案例详情HTML
    const caseDetailHtml = computed(() => md.render(caseDetailContent.value));

    const getFavoriteCases = async () => {
      try {
        loading.value = true; // 开始加载
        const params = {
          userId: localStorage.getItem("userId"), // 从本地存储获取用户ID
          language: lang.value,
          pagenum: page.value,
          pagesize: pageSize.value,
          country: filterCountry.value,
          period: filterTime.value,
        };
        console.log("获取收藏案件的参数", params);
        const response = await api.getFavoriteCases(params);
        if (response.code === 200) {
          console.log("获取收藏案件成功:", response.data);
          cases.value = response.data.cases || []; // 假设后端返回的数据结构中包含 cases 数组
          totalCasesCount.value = response.data.totalCount || 0; // 假设后端返回的数据结构中包含 totalCount
          if (cases.value.length > 0) {
              selectIndex.value = 0; // 默认选中第一个案件
          } else {
            selectIndex.value = -1; // 如果没有案件，重置选中索引
          }
        } else {
          console.error("Failed to fetch favorite cases:", response.message);
        }
      } catch (error) {
        console.error("Error fetching favorite cases:", error);
        alert(lang.value === 'zh' ? '获取收藏案件失败，请稍后再试。' : 'Failed to fetch favorite cases, please try again later.');
      } finally {
        loading.value = false; // 结束加载
      }
    };
    const changeLangAndGetFavoriteCases = async () => {
      try {
        loading.value = true; // 开始加载
        const params = {
          userId: localStorage.getItem("userId"), // 从本地存储获取用户ID
          language: lang.value,
          pagenum: page.value,
          pagesize: pageSize.value,
          country: filterCountry.value,
          period: filterTime.value,
        };
        console.log("获取收藏案件的参数", params);
        const response = await api.getFavoriteCases(params);
        if (response.code === 200) {
          console.log("获取收藏案件成功:", response.data);
          cases.value = response.data.cases || []; // 假设后端返回的数据结构中包含 cases 数组
          totalCasesCount.value = response.data.totalCount || 0; // 假设后端返回的数据结构中包含 totalCount
        } else {
          console.error("Failed to fetch favorite cases:", response.message);
        }
      } catch (error) {
        console.error("Error fetching favorite cases:", error);
        alert(lang.value === 'zh' ? '获取收藏案件失败，请稍后再试。' : 'Failed to fetch favorite cases, please try again later.');
      } finally {
        loading.value = false; // 结束加载
      }
    };
    onMounted(() => {
      // 页面加载时获取收藏夹数据
      getFavoriteCases();
    });
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
    watch([filterCountry, filterTime, page], () => {
      // 当筛选条件或分页变化时重新获取数据
      getFavoriteCases();
    });
    watch(selectCaseId, ()=>{
      console.log("当前选中案件的ID", selectCaseId.value);
      getCaseSummary();
    });
    watch(lang, () => {
      // 当语言变化时重新获取收藏夹数据
      changeLangAndGetFavoriteCases();
    });
    // 处理案例卡片点击事件
    const selectCase = (index) => {
      selectIndex.value = index;
    };
    
    // 导出Word文档
    const downloadWord = () => {
      const selectedCase = cases.value[selectIndex.value];
      if (!selectedCase) {
        console.warn("No case selected for download.");
        alert(lang.value === 'zh' ? "请先选择一个案件再下载。" : "Please select a case to download.");
        return;
      }

      const html = `
        <html>
          <head><meta charset="utf-8"/></head>
          <body>
            <h1>${selectedCase.case_name || (lang.value === 'zh' ? '案件详情' : 'Case Details')}</h1>
            <p><strong>${lang.value === 'zh' ? '国家' : 'Country'}:</strong> ${selectedCase.country}</p>
            <p><strong>${lang.value === 'zh' ? '法院' : 'Court'}:</strong> ${selectedCase.court || 'N/A'}</p>
            <p><strong>${lang.value === 'zh' ? '判决日期' : 'Judgment Date'}:</strong> ${selectedCase.judgement_date}</p>
            <p><strong>${lang.value === 'zh' ? '标签' : 'Tags'}:</strong> ${selectedCase.tags}</p>
            <hr/>
            ${caseDetailHtml.value}
          </body>
        </html>
      `;
      const blob = HtmlDocx.asBlob(html);
      saveAs(blob, `${selectedCase.case_name || (lang.value === 'zh' ? '案件详情' : 'Case Details')}.docx`);
    };

    // 打开原始判决文书链接
    const openOriginUrl = () => {
      const selectedCase = cases.value[selectIndex.value];
      if (selectedCase && selectedCase.original_document_url) { 
        window.open(selectedCase.original_document_url, "_blank");
      } else {
        console.warn("Current case has no original URL or no case is selected.");
        alert(lang.value === 'zh' ? "当前案件没有原始链接或未选择案件。" : "No original link available for this case or no case is selected.");
      }
    };

    // 取消收藏
    const unFavorite = async (caseId) => {
      if (!confirm(lang.value === 'zh' ? '确定要取消收藏此案件吗？' : 'Are you sure you want to unfavorite this case?')) {
        return;
      }

      try {
        const userId = localStorage.getItem("userId");
        const response = await api.cancelFavoriteCase({ userId, caseId }); // 调用取消收藏API
        if (response.code === 200) {
            alert(lang.value === 'zh' ? '取消收藏成功。' : 'Unfavorited successfully.');
            // 重新获取收藏列表以更新UI
            // 调用 fetchFavoriteCases 会自动处理 selectIndex 的调整
            getFavoriteCases(); 
        } else {
            alert(lang.value === 'zh' ? '取消收藏失败：' + response.message : 'Failed to unfavorite: ' + response.message);
        }

      } catch (error) {
        console.error("Failed to unfavorite case:", error);
        alert(lang.value === 'zh' ? '取消收藏失败，请稍后再试。' : 'Failed to unfavorite, please try again later.');
      }
    };

    // ==============================
    // 5. 返回数据
    // ==============================
    return {
      // 状态变量
      isCollapsed,
      page,
      pageSize,
      selectIndex,
      filterCountry,
      filterTime,
      cases, // 现在是动态获取的
      totalCasesCount, // 动态获取的总数
      loading, // 加载状态

      // 配置数据
      countryOptions,
      
      // 计算属性
      lang,
      caseDetailHtml,
      
      // 方法函数
      selectCase, // 将 case selection 逻辑封装
      getFavoriteCases,
      downloadWord,
      openOriginUrl,
      unFavorite,
    };
  },
};
</script>

<style scoped>
/* 保持原有的样式，并添加 selected-card 样式 */
.search-grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 8fr 1fr 22fr 1fr;
  grid-template-rows: 20fr 100fr;
  grid-template-areas:
    "blank1 case-list-area blank2 case-content-area blank3"
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
.case-list-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 21px;
  justify-content: flex-start;
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
  min-height: 400px; /* 确保在没有案件时也有一定的区域 */
  align-content: flex-start; /* 当内容不足时，让项目从顶部开始 */
}
.no-cases-message, .loading-message {
  width: 100%;
  text-align: center;
  color: #606266;
  font-size: 16px;
  margin-top: 50px;
}
.case-card-new {
  background: #f2f6fc;
  border-radius: 14px;
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s; /* 添加 border 过渡 */
  width: 100%;
  min-width: 220px;
  max-width: 100%;
  height: 100px;
  margin-bottom: -2px;
  padding: 16px 24px 12px 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid transparent; /* 默认透明边框 */
}
.case-card-new:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.case-card-new.selected-card {
  border: 2px solid #409eff; /* 蓝色边框 */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2); /* 蓝色阴影 */
  /* background-color: #e6f7ff; */ /* 浅蓝色背景 (注释掉，表示不是必须的) */
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
  flex: 1; /* 允许标题占据可用空间 */
  overflow: hidden; /* 隐藏溢出内容 */
  white-space: nowrap; /* 不换行 */
  text-overflow: ellipsis; /* 显示省略号 */
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
  top: 103px;
  right: -14px;
  width: 28px;
  height: 28px;
  background: #409EFF;
  color: white;
  border: 1px solid #eee;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(205,208,214,0.12);
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