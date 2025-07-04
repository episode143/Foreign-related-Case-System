<template>
  <div class="search-grid-container">
    <!-- 左侧折叠筛选框 -->
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
    <!-- 输入区占位 -->
    <div style="grid-area: input-area; background-color: transparent"></div>
    <!-- 收藏列表区 -->
    <div class="case-list-area">
      <el-scrollbar style="width: 100%; height: 590px">
        <div class="case-list-flex">
          <div
            v-for="(item, index) in pagedCases"
            :key="item.id"
            class="case-card-new"
            @click="selectIndex = (page - 1) * pageSize + index"
          >
            <div class="case-card-content">
              <div class="case-card-header">
                <span class="case-title">{{ item.title }}</span>
                <i
                  class="iconfont icon-shoucang_shixin"
                  :style="{
                    marginLeft: 'auto',
                    fontSize: '20px',
                    color: '#409EFF',
                    cursor: 'pointer'
                  }"
                  @click.stop="unFavorite(item.id)"
                  title="取消收藏"
                ></i>
              </div>
              <div class="case-card-row">
                <span class="case-country">
                  {{
                    (countryOptions.find(opt => opt.value === item.country) || {})[
                      lang === 'zh' ? 'label' : 'enLabel'
                    ]
                  }}
                </span>
                <span class="case-court">{{ item.court }}</span>
                <span class="case-date">{{ item.date }}</span>
              </div>
              <div class="case-card-row">
                <span class="case-tags">
                  {{ lang === "zh" ? "类型" : "Tags" }}：
                  {{
                    lang === 'zh'
                      ? (typeOptions.find(opt => opt.value === item.type)?.label || item.tags)
                      : (typeOptions.find(opt => opt.value === item.type)?.enLabel || item.tags)
                  }}
                </span>
                <a href="#" class="case-link" @click.prevent="viewCase(item.id)">{{ lang === "zh" ? "查看" : "View" }}</a>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div style="padding: 8px 0; display: flex; justify-content: center; width: 100%">
        <el-pagination
          size="small"
          layout="prev, pager, next"
          :total="filteredCases.length"
          :page-size="pageSize"
          v-model:current-page="page"
        />
      </div>
    </div>
    <!-- 详情区 -->
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
          {{ cases[selectIndex]?.title || (lang === 'zh' ? '请选择案件' : 'Please select a case') }}
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
import MarkdownIt from "markdown-it";
import HtmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";
import { useStore } from "vuex";

export default {
  name: "FavoriteCases",
  setup() {
    const store = useStore();
    const lang = computed(() => store.getters.lang);

    const page = ref(1);
    const pageSize = 5;
    const selectIndex = ref(0);
    const isCollapsed = ref(true);

    // 新增筛选相关
    const filterCountry = ref("");
    const filterTime = ref("");

    // 与历史案件保持一致
    const countryOptions = [
      { value: "中国", label: "中国", enLabel: "China" },
      { value: "美国", label: "美国", enLabel: "USA" },
      { value: "英国", label: "英国", enLabel: "UK" },
      { value: "法国", label: "法国", enLabel: "France" },
      { value: "德国", label: "德国", enLabel: "Germany" },
      { value: "日本", label: "日本", enLabel: "Japan" },
      { value: "韩国", label: "韩国", enLabel: "Korea" },
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
      { value: "personal_injury", label: "人身伤害", enLabel: "Personal Injury" },
      { value: "medical_malpractice", label: "医疗事故", enLabel: "Medical Malpractice" },
      { value: "product_liability", label: "产品责任", enLabel: "Product Liability" },
      { value: "intellectual_property", label: "知识产权", enLabel: "Intellectual Property" },
      { value: "cybercrime", label: "网络犯罪", enLabel: "Cybercrime" },
      { value: "environmental", label: "环境污染", enLabel: "Environmental" },
      { value: "tax", label: "税务", enLabel: "Tax" },
      { value: "bankruptcy", label: "破产", enLabel: "Bankruptcy" },
      { value: "insurance", label: "保险理赔", enLabel: "Insurance" },
      { value: "real_estate", label: "房地产", enLabel: "Real Estate" },
      { value: "contract", label: "合同", enLabel: "Contract" },
      { value: "wills", label: "遗嘱", enLabel: "Wills" },
      { value: "powers_of_attorney", label: "授权书", enLabel: "Powers of Attorney" },
      { value: "affidavits", label: "宣誓书", enLabel: "Affidavits" },
      { value: "deeds", label: "契约", enLabel: "Deeds" },
      { value: "leases", label: "租赁", enLabel: "Leases" },
      { value: "sales", label: "销售", enLabel: "Sales" },
      { value: "purchases", label: "购买", enLabel: "Purchases" },
      { value: "loans", label: "贷款", enLabel: "Loans" },
      { value: "mortgages", label: "抵押贷款", enLabel: "Mortgages" },
      { value: "securities", label: "证券", enLabel: "Securities" },
      { value: "commodities", label: "商品", enLabel: "Commodities" },
      { value: "futures", label: "期货", enLabel: "Futures" },
      { value: "options", label: "期权", enLabel: "Options" },
      { value: "swaps", label: "掉期", enLabel: "Swaps" },
      { value: "insurance_policies", label: "保险单", enLabel: "Insurance Policies" },
      { value: "retirement_accounts", label: "退休账户", enLabel: "Retirement Accounts" },
      { value: "trusts", label: "信托", enLabel: "Trusts" },
      { value: "estates", label: "遗产", enLabel: "Estates" },
      { value: "bank_accounts", label: "银行账户", enLabel: "Bank Accounts" },
      { value: "safe_deposit_boxes", label: "保险箱", enLabel: "Safe Deposit Boxes" },
      { value: "intellectual_property_rights", label: "知识产权", enLabel: "Intellectual Property Rights" },
      { value: "patents", label: "专利", enLabel: "Patents" },
      { value: "trademarks", label: "商标", enLabel: "Trademarks" },
      { value: "copyrights", label: "版权", enLabel: "Copyrights" },
      { value: "trade_secrets", label: "商业秘密", enLabel: "Trade Secrets" },
      { value: "licensing", label: "许可", enLabel: "Licensing" },
      { value: "franchising", label: "特许经营", enLabel: "Franchising" },
      { value: "distribution", label: "分销", enLabel: "Distribution" },
      { value: "agency", label: "代理", enLabel: "Agency" },
      { value: "joint_ventures", label: "合资企业", enLabel: "Joint Ventures" },
      { value: "partnerships", label: "合伙企业", enLabel: "Partnerships" },
      { value: "sole_proprietorships", label: "独资经营", enLabel: "Sole Proprietorships" },
      { value: "cooperatives", label: "合作社", enLabel: "Cooperatives" },
      { value: "non_profit_organizations", label: "非营利组织", enLabel: "Non-Profit Organizations" },
      { value: "government_entities", label: "政府机构", enLabel: "Government Entities" },
      { value: "international_organizations", label: "国际组织", enLabel: "International Organizations" },
      { value: "foreign_governments", label: "外国政府", enLabel: "Foreign Governments" },
      { value: "embassies_consulates", label: "大使馆/领事馆", enLabel: "Embassies/Consulates" },
      { value: "military", label: "军事", enLabel: "Military" },
      { value: "diplomatic", label: "外交", enLabel: "Diplomatic" },
      { value: "intelligence", label: "情报", enLabel: "Intelligence" },
      { value: "law_enforcement", label: "执法", enLabel: "Law Enforcement" },
      { value: "fire_services", label: "消防", enLabel: "Fire Services" },
      { value: "emergency_services", label: "紧急服务", enLabel: "Emergency Services" },
      { value: "healthcare", label: "医疗", enLabel: "Healthcare" },
      { value: "education", label: "教育", enLabel: "Education" },
      { value: "social_services", label: "社会服务", enLabel: "Social Services" },
      { value: "transportation", label: "运输", enLabel: "Transportation" },
      { value: "infrastructure", label: "基础设施", enLabel: "Infrastructure" },
      { value: "energy", label: "能源", enLabel: "Energy" },
      { value: "mining", label: "矿业", enLabel: "Mining" },
      { value: "agriculture", label: "农业", enLabel: "Agriculture" },
      { value: "forestry", label: "林业", enLabel: "Forestry" },
      { value: "fishing", label: "渔业", enLabel: "Fishing" },
      { value: "hunting", label: "狩猎", enLabel: "Hunting" },
      { value: "recycling", label: "回收", enLabel: "Recycling" },
      { value: "waste_management", label: "废物管理", enLabel: "Waste Management" },
      { value: "pollution_control", label: "污染控制", enLabel: "Pollution Control" },
      { value: "environmental_impact", label: "环境影响", enLabel: "Environmental Impact" },
      { value: "climate_change", label: "气候变化", enLabel: "Climate Change" },
      { value: "sustainable_development", label: "可持续发展", enLabel: "Sustainable Development" },
      { value: "renewable_energy", label: "可再生能源", enLabel: "Renewable Energy" },
      { value: "conservation", label: "保护", enLabel: "Conservation" },
      { value: "biodiversity", label: "生物多样性", enLabel: "Biodiversity" },
      { value: "ecosystem_services", label: "生态系统服务", enLabel: "Ecosystem Services" },
      { value: "cultural_heritage", label: "文化遗产", enLabel: "Cultural Heritage" },
      { value: "archaeological_sites", label: "考古遗址", enLabel: "Archaeological Sites" },
      { value: "historical_sites", label: "历史遗址", enLabel: "Historical Sites" },
      { value: "natural_wonders", label: "自然奇观", enLabel: "Natural Wonders" },
      { value: "tourist_attractions", label: "旅游景点", enLabel: "Tourist Attractions" },
      { value: "recreational_areas", label: "休闲区", enLabel: "Recreational Areas" },
      { value: "sports_venues", label: "体育场馆", enLabel: "Sports Venues" },
      { value: "entertainment_venues", label: "娱乐场所", enLabel: "Entertainment Venues" },
      { value: "shopping_areas", label: "购物区", enLabel: "Shopping Areas" },
      { value: "dining_areas", label: "餐饮区", enLabel: "Dining Areas" },
      { value: "health_and_wellness", label: "健康与养生", enLabel: "Health and Wellness" },
      { value: "beauty_and_personal_care", label: "美容与个人护理", enLabel: "Beauty and Personal Care" },
      { value: "fashion_and_accessories", label: "时尚与配饰", enLabel: "Fashion and Accessories" },
      { value: "home_and_garden", label: "家居与花园", enLabel: "Home and Garden" },
      { value: "electronics_and_technology", label: "电子与科技", enLabel: "Electronics and Technology" },
      { value: "automotive_and_transportation", label: "汽车与交通", enLabel: "Automotive and Transportation" },
      { value: "real_estate_and_property", label: "房地产与物业", enLabel: "Real Estate and Property" },
      { value: "finance_and_investment", label: "金融与投资", enLabel: "Finance and Investment" },
      { value: "business_and_services", label: "商业与服务", enLabel: "Business and Services" },
      { value: "science_and_technology", label: "科学与技术", enLabel: "Science and Technology" },
      { value: "arts_and_entertainment", label: "艺术与娱乐", enLabel: "Arts and Entertainment" },
      { value: "media_and_communication", label: "媒体与传播", enLabel: "Media and Communication" },
      { value: "education_and_training", label: "教育与培训", enLabel: "Education and Training" },
      { value: "health_and_medical", label: "健康与医疗", enLabel: "Health and Medical" },
      { value: "environment_and_nature", label: "环境与自然", enLabel: "Environment and Nature" },
      { value: "law_and_public_safety", label: "法律与公共安全", enLabel: "Law and Public Safety" },
      { value: "government_and_politics", label: "政府与政治", enLabel: "Government and Politics" },
      { value: "international_relations", label: "国际关系", enLabel: "International Relations" },
      { value: "military_and_defense", label: "军事与国防", enLabel: "Military and Defense" },
      { value: "diplomacy_and_foreign_affairs", label: "外交与外事", enLabel: "Diplomacy and Foreign Affairs" },
      { value: "intelligence_and_security", label: "情报与安全", enLabel: "Intelligence and Security" },
      { value: "law_enforcement_and_crime", label: "执法与犯罪", enLabel: "Law Enforcement and Crime" },
      { value: "fire_and_emergency_services", label: "消防与紧急服务", enLabel: "Fire and Emergency Services" },
      { value: "healthcare_and_social_services", label: "医疗与社会服务", enLabel: "Healthcare and Social Services" },
      { value: "education_and_research", label: "教育与研究", enLabel: "Education and Research" },
      { value: "science_and_innovation", label: "科学与创新", enLabel: "Science and Innovation" },
      { value: "arts_and_culture", label: "艺术与文化", enLabel: "Arts and Culture" },
      { value: "sports_and_recreation", label: "体育与休闲", enLabel: "Sports and Recreation" },
      { value: "media_and_entertainment", label: "媒体与娱乐", enLabel: "Media and Entertainment" },
      { value: "business_and_industry", label: "商业与工业", enLabel: "Business and Industry" },
      { value: "transportation_and_infrastructure", label: "运输与基础设施", enLabel: "Transportation and Infrastructure" },
      { value: "energy_and_utilities", label: "能源与公用事业", enLabel: "Energy and Utilities" },
      { value: "environmental_protection", label: "环境保护", enLabel: "Environmental Protection" },
      { value: "sustainable_development_goals", label: "可持续发展目标", enLabel: "Sustainable Development Goals" },
      { value: "climate_action", label: "气候行动", enLabel: "Climate Action" },
      { value: "life_below_water", label: "水下生物", enLabel: "Life Below Water" },
      { value: "life_on_land", label: "陆地生物", enLabel: "Life On Land" },
      { value: "peace_justice_and_strong_institutions", label: "和平、正义与强大机构", enLabel: "Peace, Justice and Strong Institutions" },
      { value: "partnerships_for_the_goals", label: "为实现目标而伙伴关系", enLabel: "Partnerships for the Goals" },
    ];

    const cases = ref([
      { id: 1, title: "多诺霍诉史蒂文森案", country: "美国", court: "沃兹吉边德法院", date: "2025.1.1", tags: "财务纠纷、故意伤人" },
      { id: 2, title: "张华诉星辰公寓案", country: "中国", court: "北京市中级法院", date: "2024.12.1", tags: "合同纠纷" },
      { id: 3, title: "丽诉味来食品公司案", country: "英国", court: "伦敦高等法院", date: "2024.11.1", tags: "侵权" },
      { id: 4, title: "彼得森诉数智互联案", country: "法国", court: "巴黎地方法院", date: "2024.10.1", tags: "知识产权" },
      { id: 5, title: "劳埃德劳动纠纷案", country: "德国", court: "柏林法院", date: "2024.9.1", tags: "劳动争议" },
      { id: 6, title: "东京地铁连环事故案", country: "日本", court: "东京地方法院", date: "2024.8.1", tags: "交通事故" },
      { id: 7, title: "案例7", country: "韩国", court: "首尔法院", date: "2024.7.1", tags: "医疗纠纷" },
    ]);

    const pagedCases = computed(() => {
      const start = (page.value - 1) * pageSize;
      return cases.value.slice(start, start + pageSize);
    });

    const filteredCases = computed(() => {
      return cases.value.filter(item => {
        const matchesCountry = filterCountry.value ? item.country === filterCountry.value : true;
        const matchesTime = filterTime.value ? (new Date(item.date).getFullYear() >= new Date().getFullYear() - filterTime.value) : true;
        return matchesCountry && matchesTime;
      });
    });

    const caseOriginUrl = ref('https://www.courtlistener.com/opinion/4328762/mike-macmann-v-mike-matthes/?q=mike');
    const caseDetailMarkdown = ref(`
### 法律案件解释：多诺霍诉史蒂文森案 (Donoghue v Stevenson)

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

    // 保留原有逻辑
    const downloadWord = () => {
      if (selectIndex.value >= 0 && selectIndex.value < cases.value.length) {
        const html = `
          <html>
            <head><meta charset="utf-8"/></head>
            <body>
              ${caseDetailHtml.value}
            </body>
          </html>
        `;
        const blob = HtmlDocx.asBlob(html);
        saveAs(blob, `${cases.value[selectIndex.value].title || '案件详情'}.docx`);
      }
    };

    const openOriginUrl = () => {
      window.open(caseOriginUrl.value, "_blank");
    };

    const unFavorite = (id) => {
      // 取消收藏逻辑
      const index = cases.value.findIndex(item => item.id === id);
      if (index !== -1) {
        cases.value.splice(index, 1);
        // 重新计算总页数，如果当前页没有案件了，回到上一页
        const totalPages = Math.ceil(cases.value.length / pageSize);
        if (page.value > totalPages && totalPages > 0) {
          page.value = totalPages;
        }
        if (index === selectIndex.value && cases.value.length > 0) {
          selectIndex.value = 0;
        }
        alert('取消收藏成功 ' + id);
      }
    };

    const viewCase = (id) => {
      const index = cases.value.findIndex(item => item.id === id);
      if (index !== -1) {
        selectIndex.value = index;
      }
    };

    return {
      lang,
      isCollapsed,
      page,
      pageSize,
      cases,
      pagedCases,
      selectIndex,
      caseDetailHtml,
      downloadWord,
      caseDetailMarkdown,
      caseOriginUrl,
      openOriginUrl,
      unFavorite,
      viewCase,
      filterCountry,
      filterTime,
      countryOptions,
      typeOptions,
      filteredCases,
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