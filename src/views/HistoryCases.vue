<template>
  <div class="history-page-container">
    <!-- 标题 -->
    <div class="history-header">
      <span class="history-title">历史记录</span>
    </div>
    <!-- 主体区域 -->
    <div class="history-main">
      <!-- 卡片区 -->
      <div class="history-card-area">
        <div class="history-card-grid">
          <div
            v-for="item in pagedCases"
            :key="item.id"
            class="case-card-new"
            @click="showCase(item)"
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
                <span class="case-tags">{{ lang === 'zh' ? '案件类型：' : 'Type:' }}{{ item.typeLabel }}</span>
                <span class="case-link" @click.stop="showCase(item)">{{ lang === 'zh' ? '查看' : 'View' }}</span>
              </div>
            </div>
          </div>
          <!-- 空白补齐 -->
          <div
            v-for="n in (12 - pagedCases.length)"
            :key="'empty'+n"
            class="case-card-new empty-card"
          ></div>
        </div>
        <!-- 分页栏 -->
        <div class="history-pagination">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredCases.length"
            :page-size="12"
            v-model:current-page="page"
          />
        </div>
      </div>
      <!-- 右侧可折叠过滤器 -->
      <div :class="['history-filter-right', { collapsed: filterCollapsed }]" >
        <div class="filter-collapse-btn" @click="filterCollapsed = !filterCollapsed">
          <i :class="filterCollapsed ? 'icon-left' : 'icon-right'"></i>
        </div>
        <transition name="fade">
          <div v-show="!filterCollapsed" class="filter-content">
            <div class="filter-title">{{ lang === 'zh' ? '筛选' : 'Filter' }}</div>
            <div class="filter-group">
              <div class="filter-label">{{ lang === 'zh' ? '国家' : 'Country' }}</div>
              <el-select v-model="filterCountry" placeholder="全部" size="small" style="width: 100%;">
                <el-option :label="lang === 'zh' ? '全部' : 'All'" value="" />
                <el-option
                  v-for="item in countryOptions"
                  :key="item.value"
                  :label="lang === 'zh' ? item.label_zh : item.label_en"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="filter-group">
              <div class="filter-label">{{ lang === 'zh' ? '案件类型' : 'Case Type' }}</div>
              <el-select v-model="filterType" placeholder="全部" size="small" style="width: 100%;">
                <el-option :label="lang === 'zh' ? '全部' : 'All'" value="" />
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="lang === 'zh' ? item.label_zh : item.label_en"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
        </transition>
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
import { useStore } from "vuex";
import MarkdownIt from "markdown-it";

export default {
  name: "HistoryCases",
  setup() {
    const store = useStore();
    const lang = computed(() => store.getters.lang || "zh");

    // 选项
    const countryOptions = [
      { value: "", label_zh: "全部", label_en: "All" },
      { value: "china", label_zh: "中国", label_en: "China" },
      { value: "usa", label_zh: "美国", label_en: "USA" },
      { value: "uk", label_zh: "英国", label_en: "UK" },
      { value: "france", label_zh: "法国", label_en: "France" },
      { value: "japan", label_zh: "日本", label_en: "Japan" },
      { value: "korea", label_zh: "韩国", label_en: "Korea" },
      { value: "russia", label_zh: "俄罗斯", label_en: "Russia" },
      { value: "germany", label_zh: "德国", label_en: "Germany" },
    ];
    const typeOptions = [
      { value: "theft", label_zh: "盗窃", label_en: "Theft" },
      { value: "fraud", label_zh: "诈骗", label_en: "Fraud" },
      { value: "intentional_injury", label_zh: "故意伤害", label_en: "Intentional Injury" },
      { value: "traffic_accident", label_zh: "交通肇事", label_en: "Traffic Accident" },
      { value: "contract_dispute", label_zh: "合同纠纷", label_en: "Contract Dispute" },
      { value: "labor_dispute", label_zh: "劳动争议", label_en: "Labor Dispute" },
      { value: "divorce", label_zh: "离婚案", label_en: "Divorce" },
      { value: "property_damage", label_zh: "财产损害赔偿纠纷", label_en: "Property Damage Compensation Dispute" },
      { value: "house_sale", label_zh: "房屋买卖合同纠纷", label_en: "House Sale Contract Dispute" },
      { value: "tort_liability", label_zh: "侵权责任纠纷", label_en: "Tort Liability Dispute" },
      { value: "medical_accident", label_zh: "医疗事故纠纷", label_en: "Medical Accident Dispute" },
      { value: "ip_dispute", label_zh: "知识产权纠纷", label_en: "Intellectual Property Dispute" },
      { value: "admin_penalty", label_zh: "行政处罚纠纷", label_en: "Administrative Penalty Dispute" },
      { value: "land_expropriation", label_zh: "土地征收补偿争议", label_en: "Land Expropriation Compensation Dispute" },
      { value: "admin_license", label_zh: "行政许可争议", label_en: "Administrative License Dispute" },
      { value: "other", label_zh: "其它类型", label_en: "Other Types" },
    ];

    // 示例数据
    const cases = ref(Array.from({ length: 30 }).map((_, i) => {
      const countryIdx = i % (countryOptions.length - 1) + 1;
      const typeIdx = i % typeOptions.length;
      return {
        id: i + 1,
        title: `案例${i + 1}`,
        country: countryOptions[countryIdx].value,
        countryLabel_zh: countryOptions[countryIdx].label_zh,
        countryLabel_en: countryOptions[countryIdx].label_en,
        court: ["北京市中级法院", "纽约地方法院", "伦敦高等法院", "巴黎地方法院", "柏林法院"][i % 5],
        date: `2024.${(i % 12) + 1}.${(i % 28) + 1}`,
        type: typeOptions[typeIdx].value,
        typeLabel_zh: typeOptions[typeIdx].label_zh,
        typeLabel_en: typeOptions[typeIdx].label_en,
      };
    }));

    // 过滤器
    const filterCountry = ref("");
    const filterType = ref("");
    const filterCollapsed = ref(false);

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
      filteredCases.value
        .slice((page.value - 1) * 12, page.value * 12)
        .map(item => ({
          ...item,
          countryLabel: lang.value === "zh" ? item.countryLabel_zh : item.countryLabel_en,
          typeLabel: lang.value === "zh" ? item.typeLabel_zh : item.typeLabel_en,
        }))
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
      lang,
      filterCollapsed,
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
html, body, #app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.history-page-container {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.history-header {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 80px;
  background: #fff;
}

.history-title {
  color: #409eff;
  font-size: 20px;
  font-weight: 600;
}
.history-main {
  flex: 1;
  display: flex;
  flex-direction: row;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.history-card-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  overflow: hidden;
}

.history-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  height: 1fr;
  flex: 1;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
  padding: 20px 0 0 0;
}

.case-card-new {
  background: #f2f6fc;
  border-radius: 14px;
  cursor: pointer;
  width: 90%;
  height: 90%;
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

.history-pagination {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  background: #fff;
  flex-shrink: 0;
}

.history-filter-right {
  background: #EBEEF5;
  width: 320px;
  position: relative;
  padding: 32px 24px 24px 24px;
  height: 100%;
  transition: width 0.2s, padding 0.2s;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.history-filter-right.collapsed {
  width: 40px;
  padding: 0;
  align-items: center;
}

.filter-collapse-btn {
  position: absolute;
  left: -16px;
  top: 32px;
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(205, 208, 214, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  border: 1px solid #e4e7ed;
  transition: left 0.2s;
}
.icon-left:before {
  content: '⮜';
  font-size: 18px;
  color: #909399;
}
.icon-right:before {
  content: '⮞';
  font-size: 18px;
  color: #909399;
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  height: 0;
  overflow: hidden;
}
.filter-content {
  width: 100%;
  margin-top: 24px;
}
.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 18px;
}
.filter-group {
  margin-bottom: 18px;
}
.filter-label {
  font-size: 15px;
  color: #fff;
  margin-bottom: 6px;
  font-weight: 500;
}
:deep(.el-dialog__body) {
  padding-top: 0;
}
</style>