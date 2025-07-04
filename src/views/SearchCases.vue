<template>
  <div class="search-grid-container">
    <!-- 左侧折叠筛选框 -->
    <div :class="['left-panel', { collapsed: isCollapsed }]">
      <button class="collapse-btn" :class="{ collapsed: isCollapsed }" @click="isCollapsed = !isCollapsed">
        <span v-if="isCollapsed">⮞</span>
        <span v-else>⮜</span>
      </button>
      <div v-show="!isCollapsed" class="panel-content">
        <h3 style="margin-bottom:18px;">{{ lang === 'zh' ? '筛选' : 'Filter' }}</h3>
        <div class="filter-group">
          <!-- 国家 -->
          <div class="filter-label">{{ lang === 'zh' ? '国家' : 'Country' }}</div>
          <select v-model="filterCountry" class="filter-select">
            <option value="">{{ lang === 'zh' ? '全部' : 'All' }}</option>
            <option v-for="item in countryOptions" :key="item.value" :value="item.value">
              {{ lang === 'zh' ? item.label : item.enLabel }}
            </option>
          </select>
        </div>
        <!-- 判决时间 -->
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
      </div>
    </div>
    <!-- 原有内容 -->
    <div style="grid-area: input-area; background-color: transparent">
      <div style="width: 100%; height: 85%; background-color: white; border-radius: 15px; border: 1px solid rgb(221.7, 222.6, 224.4); position: relative">
        <button
          style="
            position: absolute;
            right: 6px;
            bottom: 5px;
            z-index: 10;
            background-color: #409EFF;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <i class="iconfont icon-sousuo" style="font-size: 20px; color: white"></i>
        </button>
        <el-input
          class="no-border-textarea"
          v-model="textarea"
          style="padding-top: 12px; width: 100%"
          :autosize="{ minRows: 2, maxRows: 2 }"
          type="textarea"
          :placeholder="lang === 'zh' ? '请输入您想查询案件的关键字' : 'Please enter the keywords of the case you want to query'"
        />
      </div>
    </div>
    <div class="case-list-area">
      <el-scrollbar style="width: 100%; height: 480px">
        <div class="case-list-flex">
          <div v-for="(item, index) in pagedCases" :key="item.id" class="case-card-new" @click="selectIndex = (page - 1) * 6 + index">
            <div class="case-card-content">
              <div class="case-card-header">
                <span class="case-title">{{ item.title }}</span>
                <i
                  class="iconfont icon-shoucang_shixin"
                  :style="{
                    marginLeft: 'auto',
                    fontSize: '20px',
                    color: item.favorite ? '#409EFF' : 'rgb(199.5, 201, 204)',
                    cursor: 'pointer'
                  }"
                  @click.stop="item.favorite = !item.favorite"
                  title="收藏"
                ></i>
              </div>
              <div class="case-card-row">
                <span class="case-country">{{ item.country }}</span>
                <span class="case-court">{{ item.court }}</span>
                <span class="case-date">{{ item.date }}</span>
              </div>
              <div class="case-card-row">
                <span class="case-tags">{{lang === "zh" ? "标签" : "Tags"}}：{{ item.tags }}</span>
                <a href="#" class="case-link">{{ lang === "zh" ? "查看" : "View" }}</a>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div style="padding: 8px 0; display: flex; justify-content: center; width: 100%">
        <el-pagination size="small" layout="prev, pager, next" :total="cases.length" :page-size="6" v-model:current-page="page" />
      </div>
    </div>

    <div style="grid-area: case-content-area;background-color: transparent;">
      <!-- 顶部栏 -->
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
          {{ cases[selectIndex].title }}
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
      <!-- 内容区 -->
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
import { ref, computed } from "vue";
import { useStore } from "vuex";
import MarkdownIt from "markdown-it";
import HtmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";

export default {
  name: "SearchCases",
  setup() {
    const store = useStore();
    const lang = computed(() => store.getters.lang);

    // 筛选相关
    const isCollapsed = ref(true);
    const filterCountry = ref("");
    const filterTypes = ref([]);
    const filterTime = ref("");

    const countryOptions = [
      { value: "china", label: "中国", enLabel: "China" },
      { value: "usa", label: "美国", enLabel: "USA" },
      { value: "uk", label: "英国", enLabel: "UK" },
      { value: "france", label: "法国", enLabel: "France" },
      { value: "japan", label: "日本", enLabel: "Japan" },
      { value: "korea", label: "韩国", enLabel: "Korea" },
      { value: "russia", label: "俄罗斯", enLabel: "Russia" },
      { value: "germany", label: "德国", enLabel: "Germany" },
    ];
    const typeOptions = [
      { value: "theft", label: "盗窃", enLabel: "Theft" },
      { value: "fraud", label: "诈骗", enLabel: "Fraud" },
      { value: "intentional_injury", label: "故意伤害", enLabel: "Intentional Injury" },
      { value: "traffic_accident", label: "交通肇事", enLabel: "Traffic Accident" },
      { value: "contract_dispute", label: "合同纠纷", enLabel: "Contract Dispute" },
      { value: "labor_dispute", label: "劳动争议", enLabel: "Labor Dispute" },
      { value: "divorce", label: "离婚案", enLabel: "Divorce" },
      { value: "property_damage", label: "财产损害赔偿纠纷", enLabel: "Property Damage" },
      { value: "house_sale", label: "房屋买卖合同纠纷", enLabel: "House Sale Dispute" },
      { value: "tort_liability", label: "侵权责任纠纷", enLabel: "Tort Liability" },
      { value: "medical_accident", label: "医疗事故纠纷", enLabel: "Medical Accident" },
      { value: "ip_dispute", label: "知识产权纠纷", enLabel: "IP Dispute" },
      { value: "admin_penalty", label: "行政处罚纠纷", enLabel: "Admin Penalty" },
      { value: "land_expropriation", label: "土地征收补偿争议", enLabel: "Land Expropriation" },
      { value: "admin_license", label: "行政许可争议", enLabel: "Admin License" },
      { value: "other", label: "其它类型", enLabel: "Other" },
    ];

    // 案例数据（注意country字段用value）
    const cases = ref([
      {
        id: 1,
        title: "多诺霍诉史蒂文森案",
        country: "usa",
        court: "沃兹吉边德法院",
        date: "2025.1.1",
        tags: "财务纠纷、故意伤人",
        favorite: false,
      },
      {
        id: 2,
        title: "张华诉星辰公寓案",
        country: "china",
        court: "北京市中级法院",
        date: "2024.12.1",
        tags: "合同纠纷",
        favorite: false,
      },
      {
        id: 3,
        title: "丽诉味来食品公司案",
        country: "uk",
        court: "伦敦高等法院",
        date: "2024.11.1",
        tags: "侵权",
        favorite: false,
      },
      {
        id: 4,
        title: "彼得森诉数智互联案",
        country: "france",
        court: "巴黎地方法院",
        date: "2024.10.1",
        tags: "知识产权",
        favorite: false,
      },
      {
        id: 5,
        title: "劳埃德劳动纠纷案",
        country: "germany",
        court: "柏林法院",
        date: "2024.9.1",
        tags: "劳动争议",
        favorite: false,
      },
      {
        id: 6,
        title: "东京地铁连环事故案",
        country: "japan",
        court: "东京地方法院",
        date: "2024.8.1",
        tags: "交通事故",
        favorite: false,
      },
      {
        id: 7,
        title: "案例7",
        country: "korea",
        court: "首尔法院",
        date: "2024.7.1",
        tags: "医疗纠纷",
        favorite: false,
      },
    ]);

    // 分页
    const page = ref(1);
    const pagedCases = computed(() => {
      // 先筛选
      let filtered = cases.value.filter(item => {
        // 国家
        const inCountry = filterCountry.value ? item.country === filterCountry.value : true;
        // 多选类型
        const inType = filterTypes.value.length > 0 ? filterTypes.value.includes(item.tags) : true;
        // 判决时间
        let inTime = true;
        if (filterTime.value) {
          const year = parseInt(item.date.split(".")[0]);
          const nowYear = new Date().getFullYear();
          inTime = nowYear - year < parseInt(filterTime.value);
        }
        return inCountry && inType && inTime;
      });
      // 分页
      const start = (page.value - 1) * 6;
      return filtered.slice(start, start + 6);
    });

    // 其它功能
    const textarea = ref("");
    const selectIndex = ref(0);
    const caseOriginUrl = ref("https://www.courtlistener.com/opinion/4328762/mike-macmann-v-mike-matthes/?q=mike");
    const caseDetailMarkdown = ref(`### 法律案件解释：多诺霍诉史蒂文森案 (Donoghue v Stevenson)

这是一份案例解释——一个在普通法系国家（如英国、加拿大、澳大利亚等）具有里程碑意义的法律案件：多诺霍诉史蒂文森案（Donoghue v Stevenson [1932] AC 562），又被称为“蜗牛案”。这个案件确立了现代侵权法中最重要的原则之一——**疏忽侵权 (Negligence)** 的原则。

#### 1. 案件名称
多诺霍诉史蒂文森案 (Donoghue v Stevenson)，或称“蜗牛案”。
案件编号: [1932] AC 562

#### 2. 案件背景/事实 (Background/Facts)
1932年，一位名叫梅多诺霍（May Donoghue）的女士和朋友在苏格兰佩斯利的一家咖啡馆喝饮料，她的朋友为她点了一杯由生产商史蒂文森（Stevenson）公司生产的姜汁啤酒。当多诺霍女士喝到一半时，她发现瓶子里有一只已经腐烂的蜗牛尸体。

看到蜗牛后，多诺霍女士受到了惊吓，并大病和因此上了胃肠炎和严重的精神打击。由于姜汁啤酒是朋友购买的，多诺霍女士与咖啡馆老板仅仅没有直接合同关系，普通法的传统，并没有合同关系就不能索赔。因此，多诺霍女士决定直接起诉案件中啤酒的生产商史蒂文森公司，理由是其疏忽（negligence）。她的律师，史蒂文森公司在生产过程中未能采取相应注意，导致蜗牛进入了瓶子，并对消费者造成了伤害。

#### 3. 法律争议焦点 (Legal Issue)
本案的核心法律争议是：

**在没有直接合同关系的前提下，产品制造商对最终消费者是否负有避免疏忽行为的法律责任？**
（即：是否在一个制造商对其产品最终使用者负有的“注意义务”（Duty of Care），即使两者之间没有合同关系？）

#### 4. 法院判决 (Court Decision)
英国上议院（House of Lords），于1932年做出了具有深远影响力的判决。上议院认为买卖双方的契约关系的狭义观点被突破，多诺霍女士
    `);
    const md = new MarkdownIt();
    const caseDetailHtml = computed(() => md.render(caseDetailMarkdown.value));
    const downloadWord = () => {
      const html = `
        <html>
          <head><meta charset="utf-8"/></head>
          <body>
            ${caseDetailHtml.value}
          </body>
        </html>
      `;
      const blob = HtmlDocx.asBlob(html);
      saveAs(blob, `${cases.value[selectIndex.value].title || "案件详情"}.docx`);
    };
    const openOriginUrl = () => {
      window.open(caseOriginUrl.value, "_blank");
    };

    return {
      lang,
      isCollapsed,
      filterCountry,
      filterTypes,
      filterTime,
      countryOptions,
      typeOptions,
      cases,
      page,
      pagedCases,
      textarea,
      selectIndex,
      caseOriginUrl,
      caseDetailHtml,
      downloadWord,
      openOriginUrl,
    };
  }
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
