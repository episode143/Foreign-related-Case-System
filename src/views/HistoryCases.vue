<template>
  <div class="history-container">
    <div class="history-header">
      {{ lang === 'zh' ? '历史记录' : 'History Records' }}
    </div>
    <button class="collapse-btn" :class="{ collapsed: isCollapsed }" @click="isCollapsed = !isCollapsed">
      <span v-if="isCollapsed">⮜</span>
      <span v-else>⮞</span>
    </button>
    <!-- 右侧折叠过滤器 -->
    <div :class="['right-panel', { collapsed: isCollapsed }]" :style="isCollapsed ? { pointerEvents: 'none' } : {}">
      <div v-show="!isCollapsed" class="panel-content">
        <h3 style="margin-bottom:18px;">筛选</h3>
        <div class="filter-group">
          <div class="filter-label">国家</div>
          <select v-model="filterCountry" class="filter-select">
            <option value="">全部</option>
            <option v-for="item in countryOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <div class="filter-label">案件类型</div>
          <select v-model="filterType" class="filter-select">
            <option value="">全部</option>
            <option v-for="item in typeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <!-- 右侧卡片区 -->
    <div
      class="card-area"
      :class="{ 'expand': isCollapsed }"
    >
      <div class="card-grid">
        <div
          v-for="item in pagedCases"
          :key="item.id"
          class="case-card-new"
        >
          <div class="case-card-content">
            <div class="case-card-header">
              <span class="case-title">{{ item.title }}</span>
            </div>
            <div class="case-card-row">
              <span class="case-country">{{ item.countryLabel }}</span>
              <span class="case-court">{{ item.court }}</span>
              <span class="case-date">{{ item.date }}</span>
            </div>
            <div class="case-card-row">
              <span class="case-tags">{{ lang === "zh" ? "类型" : "Tags" }}：{{ item.typeLabel }}</span>
              <span class="case-link" @click="showCase(item)">{{ lang === 'zh' ? '查看':'View' }}</span>
            </div>
          </div>
        </div>
        <!-- 空白补齐 -->
        <div
          v-for="n in Math.max(16 - pagedCases.length, 0)"
          :key="'empty'+n"
          class="case-card-new empty-card"
        ></div>
      </div>
      <div class="history-pagination">
        <el-pagination
          :page-size="16"
          :pager-count="11"
          layout="prev, pager, next"
          :total="1000"
          v-model:current-page="page"
        />
      </div>
    </div>
    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogCase?.title"
      width="800px"
      top="60px"
      :close-on-click-modal="false"
    >
      <div v-html="caseDetailHtml"></div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import MarkdownIt from "markdown-it";

export default {
  name: "HistoryCases",
  setup() {
    // 选项
    const countryOptions = [
      { value: "china", label: "中国" },
      { value: "usa", label: "美国" },
      { value: "uk", label: "英国" },
      { value: "france", label: "法国" },
      { value: "japan", label: "日本" },
      { value: "korea", label: "韩国" },
      { value: "russia", label: "俄罗斯" },
      { value: "germany", label: "德国" },
    ];
    const typeOptions = [
      { value: "theft", label: "盗窃" },
      { value: "fraud", label: "诈骗" },
      { value: "intentional_injury", label: "故意伤害" },
      { value: "traffic_accident", label: "交通肇事" },
      { value: "contract_dispute", label: "合同纠纷" },
      { value: "labor_dispute", label: "劳动争议" },
      { value: "divorce", label: "离婚案" },
      { value: "property_damage", label: "财产损害赔偿纠纷" },
      { value: "house_sale", label: "房屋买卖合同纠纷" },
      { value: "tort_liability", label: "侵权责任纠纷" },
      { value: "medical_accident", label: "医疗事故纠纷" },
      { value: "ip_dispute", label: "知识产权纠纷" },
      { value: "admin_penalty", label: "行政处罚纠纷" },
      { value: "land_expropriation", label: "土地征收补偿争议" },
      { value: "admin_license", label: "行政许可争议" },
      { value: "other", label: "其它类型" },
    ];

    // 示例数据
    const cases = ref(Array.from({ length: 30 }).map((_, i) => {
      const countryIdx = i % countryOptions.length;
      const typeIdx = i % typeOptions.length;
      return {
        id: i + 1,
        title: `案例${i + 1}`,
        country: countryOptions[countryIdx].value,
        countryLabel: countryOptions[countryIdx].label,
        court: ["北京市中级法院", "纽约地方法院", "伦敦高等法院", "巴黎地方法院", "柏林法院"][i % 5],
        date: `2024.${(i % 12) + 1}.${(i % 28) + 1}`,
        type: typeOptions[typeIdx].value,
        typeLabel: typeOptions[typeIdx].label,
      };
    }));

    // 过滤器
    const filterCountry = ref("");
    const filterType = ref("");
    const isCollapsed = ref(true);

    // 分页
    const page = ref(1);
    const filteredCases = computed(() => {
      return cases.value.filter(item => {
        return (
          (filterCountry.value ? item.country === filterCountry.value : true) &&
          (filterType.value ? item.type === filterType.value : true)
        );
      });
    });
    const pagedCases = computed(() =>
      filteredCases.value.slice((page.value - 1) * 16, page.value * 16)
    );

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogCase = ref(null);
    const md = new MarkdownIt();
    const caseDetailHtml = ref("");

    function showCase(item) {
      dialogCase.value = item;
      caseDetailHtml.value = md.render(`
### 智能案件分析

**案件名称：** ${item.title}

**国家：** ${item.countryLabel}  
**法院：** ${item.court}  
**日期：** ${item.date}  
**案件类型：** ${item.typeLabel}

---

这里展示智能案件分析内容，可根据实际需求替换为真实分析结果。
      `);
      dialogVisible.value = true;
    }

    return {
      isCollapsed,
      filterCountry,
      filterType,
      countryOptions,
      typeOptions,
      page,
      filteredCases,
      pagedCases,
      dialogVisible,
      dialogCase,
      caseDetailHtml,
      showCase,
    };
  },
};
</script>

<style scoped>
.history-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

.history-header {
  position: absolute;
  top: -2px;
  left: 46px;
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  z-index: 20;
  letter-spacing: 2px;
  user-select: none;
}

.right-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  background: #fff;
  transition: right 0.3s;
  z-index: 10;
  border-left: 1px solid #eee;
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}
.right-panel.collapsed {
  right: -200px;
}
.collapse-btn {
  position: absolute;
  top: 20px;
  right: 184px;
  width: 32px;
  height: 32px;
  background: #409EFF;
  color: white;
  border: 1px solid #eee;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(205,208,214,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  z-index: 11;
  transition: right 0.3s;
}

/* 折叠时按钮只露出一半 */
.collapse-btn.collapsed {
  right: -16px; /* 负一半宽度，只露出一半 */
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
.card-area {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  transition: padding-right 0.3s;
  padding-right: 200px; /* 预留右侧面板宽度 */
  box-sizing: border-box;
  overflow: hidden;
}
.card-area.expand {
  padding-right: 0 !important;
  transition: padding-right 0.3s;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr); /* 4行 */
  gap: 14px 20px;
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 32px; /* 让卡片整体下移，避免与标题重叠 */
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
  padding-left: 32px;
  padding-right: 32px;
}
.case-card-new {
  background: #f2f6fc;
  border-radius: 14px;
  cursor: pointer;
  width: 95%;
  height: 95%;
  margin: auto;
  padding: 16px 24px 12px 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}
.case-card-new.empty-card {
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: default;
  pointer-events: none;
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
  margin-right: 24px;
}
.case-court {
  font-size: 14px;
  color: #222;
  margin-right: 24px;
}
.case-date {
  font-size: 14px;
  color: #222;
  margin-left: auto;
}
.case-tags {
  font-size: 14px;
  color: #222;
}
.case-link {
  float: right;
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
  margin-left: auto;
  text-decoration: underline;
  cursor: pointer;
}
.case-link:hover {
  color: #1867c0;
}
.history-pagination {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 20px 0 0 0; /* 让分页栏紧贴卡片区 */
  
  background: #fff;
  flex-shrink: 0;
  padding-left: 24px;
}
</style>