<template>
  <div class="home-view">
    <!-- 收藏案件区域 -->
    <div style="grid-template-areas: 'favorite-cases'; display: flex; justify-content: center; align-items: center">
      <div class="favorite-cases" style="margin-bottom: 20px; background-color: transparent; width: 990px">
        <div class="section-header">
          <h3 style="font-weight: bold; display: inline-block; color: #409eff">{{ recentFavoritesText }}</h3>
        </div>
        <!-- 横向滚动条展示最近收藏 -->
        <el-scrollbar>
          <div class="scrollbar-flex-content">
            <div v-for="caseItem in favoriteCases.slice(0, 20)" :key="caseItem.id" class="scrollbar-demo-item" @click="goToCaseDetail(caseItem.id)">
              <div style="width: 220px">
                <h4 style="font-size: 16px; color: #222; font-weight: 600; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ caseItem.title }}</h4>
                <div style="display: flex; font-size: 14px; color: #667085; margin-bottom: 10px">
                  <span style="margin-right: 15px"><i class="iconfont icon-court" style="margin-right: 5px"></i>{{ caseItem.court }}</span>
                  <span><i class="iconfont icon-date" style="margin-right: 5px"></i>{{ caseItem.date }}</span>
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

    <!-- 新搜索区域 -->
    <div class="search-area" style="background-color: transparent;">
      <div style="width: 990px; height: 100%;">
        <!-- 筛选按钮区 -->
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">{{ lang === 'zh' ? '国家：' : 'Country:' }}</span>
            <el-radio-group v-model="filter.country" size="small">
              <el-radio-button
                v-for="item in countryOptions"
                :key="item.value"
                :label="item.value"
              >{{ lang === 'zh' ? item.label_zh : item.label_en }}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-group">
            <span class="filter-label">{{ lang === 'zh' ? '判决时间：' : 'Judgment Time:' }}</span>
            <el-radio-group v-model="filter.time" size="small">
              <el-radio-button
                v-for="item in timeOptions"
                :key="item.value"
                :label="item.value"
              >{{ lang === 'zh' ? item.label_zh : item.label_en }}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-group">
            <span class="filter-label">{{ lang === 'zh' ? '案件类型：' : 'Case Type:' }}</span>
            <el-select
              v-model="filter.caseType"
              multiple
              collapse-tags
              :placeholder="lang === 'zh' ? '全部' : 'All'"
              size="small"
              style="min-width: 320px"
            >
              <el-option
                v-for="item in caseTypeOptions"
                :key="item.value"
                :label="lang === 'zh' ? item.label_zh : item.label_en"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <!-- 输入框区 -->
        <div class="input-box-outer">
          <div class="input-box-inner">
            <el-input v-model="searchText" type="textarea" :autosize="{ minRows: 3, maxRows: 3 }" class="styled-textarea" :placeholder="searchPlaceholderText" />
            <button class="send-btn" @click="searchCases">
              <i class="iconfont icon-sousuo" style="font-size: 23px;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "HomeView",
  setup() {
    const store = useStore();
    const router = useRouter();
    const searchText = ref("");
    const filter = ref({
      country: "",
      time: "",
      caseType: [],
    });
    const lang = computed(() => store.getters.lang);

    // 选项数据（value为后端参数，label_zh/label_en为显示文本）
    const countryOptions = [
      { value: "", label_zh: "全部", label_en: "All" },
      { value: "china", label_zh: "中国", label_en: "China" },
      { value: "usa", label_zh: "美国", label_en: "USA" },
      { value: "uk", label_zh: "英国", label_en: "UK" },
      { value: "france", label_zh: "法国", label_en: "France" },
      { value: "japan", label_zh: "日本", label_en: "Japan" },
      { value: "korea", label_zh: "韩国", label_en: "Korea" },
      { value: "russia", label_zh: "俄罗斯", label_en: "Russia" },
    ];
    const timeOptions = [
      { value: "", label_zh: "全部", label_en: "All" },
      { value: "1", label_zh: "最近一年", label_en: "Last 1 Year" },
      { value: "3", label_zh: "最近三年", label_en: "Last 3 Years" },
      { value: "5", label_zh: "最近五年", label_en: "Last 5 Years" },
      { value: "10", label_zh: "最近十年", label_en: "Last 10 Years" },
    ];
    const caseTypeOptions = [
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

    const recentFavoritesText = computed(() => {
      return lang.value === "zh" ? "最近收藏案件" : "Recently Favorited Cases";
    });

    const searchPlaceholderText = computed(() => {
      return lang.value === "zh"
        ? "请输入您想查询案件的关键字，可输入案件名称、当事人、案号等"
        : "Enter keywords to search for cases, such as case names, parties, case numbers, etc.";
    });

    // 收藏案件数据（如需测试可补充到20条）
    const favoriteCases = ref([
      {
        id: 1,
        title: "多诺霍诉史蒂文森案",
        country: "美国",
        court: "沃兹吉边德法院",
        date: "2025.1.1",
        tags: "财务纠纷、故意伤人",
      },
      {
        id: 2,
        title: "张华诉星辰公寓案",
        country: "中国",
        court: "北京市中级法院",
        date: "2024.12.1",
        tags: "合同纠纷",
      },
      {
        id: 3,
        title: "丽诉味来食品公司案",
        country: "英国",
        court: "伦敦高等法院",
        date: "2024.11.1",
        tags: "侵权",
      },
      {
        id: 4,
        title: "彼得森诉数智互联案",
        country: "法国",
        court: "巴黎地方法院",
        date: "2024.10.1",
        tags: "知识产权",
      },
      {
        id: 5,
        title: "多诺霍诉史蒂文森案",
        country: "美国",
        court: "沃兹吉边德法院",
        date: "2025.1.1",
        tags: "财务纠纷、故意伤人",
      },
      {
        id: 6,
        title: "张华诉星辰公寓案",
        country: "中国",
        court: "北京市中级法院",
        date: "2024.12.1",
        tags: "合同纠纷",
      },
      {
        id: 7,
        title: "丽诉味来食品公司案",
        country: "英国",
        court: "伦敦高等法院",
        date: "2024.11.1",
        tags: "侵权",
      },
      {
        id: 8,
        title: "彼得森诉数智互联案",
        country: "法国",
        court: "巴黎地方法院",
        date: "2024.10.1",
        tags: "知识产权",
      },
    ]);


    // 搜索案件
    const searchCases = () => {
      // 组合搜索条件
      // const searchParams = {
      //   keyword: searchText.value,
      //   country: filter.value.country,
      //   time: filter.value.time,
      //   caseType: filter.value.caseType,
      // };
      // 执行搜索逻辑
      router.push("/case-query/search");
    };

    return {
      searchText,
      filter,
      favoriteCases,
      searchCases,
      recentFavoritesText,
      searchPlaceholderText,
      lang,
      countryOptions,
      timeOptions,
      caseTypeOptions,
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
  padding: 40px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px; /* 新增，保证筛选区和输入区字体不小于14px */
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
