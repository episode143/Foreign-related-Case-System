<template>
  <div class="favorites-container">
    <div class="main-content">
      <!-- 案例列表区域 - 增加收缩功能 -->
      <div class="case-list" :class="{ 'collapsed': isCollapsed }">
        <div class="case-list-header">
          <span>{{ lang === 'zh' ? '案例列表' : 'Case List' }}</span>
          <div class="toggle-btn" @click="toggleCollapse">
            <el-icon v-if="isCollapsed" class="expand-icon">
              <ArrowRightBold />
            </el-icon>
            <el-icon v-else class="collapse-icon">
              <ArrowLeftBold />
            </el-icon>
          </div>
        </div>
        <div class="case-list-content">
          <div class="case-list-flex">
            <div v-for="item in pagedCases" :key="item.id" class="case-card-new">
              <div class="case-card-content">
                <div class="case-card-header">
                  <i class="iconfont icon-xiaofadianwenzhang" style="font-size: 26px; color: #333; margin-right: 10px"></i>
                  <span class="case-title">{{ item.title }}</span>
                  <span class="favorite-icon" @click.stop="unFavorite(item.id)">
                    <el-icon class="star-icon">
                      <StarFilled />
                    </el-icon>
                  </span>
                </div>
                <div class="case-card-row">
                  <span class="case-country">{{ item.country }}</span>
                  <span class="case-court">{{ item.court }}</span>
                  <span class="case-date">{{ item.date }}</span>
                </div>
                <div class="case-card-row">
                  <span class="case-tags">{{ lang  === 'zh' ? '标签' : 'tag' }}：{{ item.tags }}</span>
                  <a href="#" class="case-link" @click.prevent="viewCase(item.id)">{{ lang  === 'zh' ? '查看' : 'view' }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 分页控件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="page"
            :page-size="pageSize"
            :total="cases.length"
            layout="prev, pager, next, total"
            @current-change="handleCurrentChange"
          />
        </div>
      </div> 
      <!-- 分隔线 -->
      <div class="divider" :class="{ 'collapsed': isCollapsed }"></div>     
      <!-- 案件详情区域 -->
      <div class="case-detail" :class="{ 'expanded': isCollapsed }">
        <div class="case-detail-header">
          <span class="case-title-large">{{ cases[selectIndex].title || '请选择案件' }}</span>
          <div class="header-actions">
            <span class="action-item" @click="openOriginUrl">{{ lang  === 'zh' ? '查看原始判决文书' : 'View Original Judgment' }}</span>
            <i class="iconfont icon-xiazai download-icon" @click="downloadWord"></i>
          </div>
        </div>
        <div class="case-detail-content">
          <div v-html="caseDetailHtml" class="markdown-content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import MarkdownIt from "markdown-it";
import HtmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";
import { StarFilled, ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { useStore } from "vuex";

export default {
  name: "FavoriteCases",
  components: {
    StarFilled,
    ArrowLeftBold,
    ArrowRightBold,
  },
  setup() {
    const store = useStore();
    const page = ref(1);
    const pageSize = ref(4); // 每页显示4个案件
    const selectIndex = ref(0);
    const isCollapsed = ref(false); // 列表收缩状态
    const lang = computed(() => store.getters.lang);

    const cases = ref([
      { id: 1, title: "多诺霍诉史蒂文森案", country: "美国", court: "沃兹吉边德法院", date: "2025.1.1", tags: "财务纠纷、故意伤人" },
      { id: 2, title: "张华诉星辰公寓案", country: "中国", court: "北京市中级法院", date: "2024.12.1", tags: "合同纠纷" },
      { id: 3, title: "丽诉味来食品公司案", country: "英国", court: "伦敦高等法院", date: "2024.11.1", tags: "侵权" },
      { id: 4, title: "彼得森诉数智互联案", country: "法国", court: "巴黎地方法院", date: "2024.10.1", tags: "知识产权" },
      { id: 5, title: "劳埃德劳动纠纷案", country: "德国", court: "柏林法院", date: "2024.9.1", tags: "劳动争议" },
      { id: 6, title: "东京地铁连环事故案", country: "日本", court: "东京地方法院", date: "2024.8.1", tags: "交通事故" },
      { id: 7, title: "案例7", country: "韩国", court: "首尔法院", date: "2024.7.1", tags: "医疗纠纷" },
    ]);
    
    // 计算当前页的案件列表
    const pagedCases = computed(() => {
      const start = (page.value - 1) * pageSize.value;
      return cases.value.slice(start, start + pageSize.value);
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

    // 下载为 Word
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
        const totalPages = Math.ceil(cases.value.length / pageSize.value);
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

    // 分页事件处理
    const handleCurrentChange = (val) => {
      page.value = val;
    };
    
    // 切换收缩状态
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    return {
      page,
      lang,
      pageSize,
      cases,
      pagedCases,
      caseDetailHtml,
      selectIndex,
      downloadWord,
      caseDetailMarkdown,
      caseOriginUrl,
      openOriginUrl,
      unFavorite,
      viewCase,
      handleCurrentChange,
      isCollapsed,
      toggleCollapse,
    };
  },
};
</script>

<style scoped>
/* 基础布局优化 */
.favorites-container {
  position: relative;
  width: 100%;
  height: 90vh;
  display: flex;
  overflow: hidden;
  background-color: #f5f7fa;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  border-bottom: 3px;
  position: relative;
}

/* 案件列表区域样式 */
.case-list {
  width: 300px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s;
  flex-shrink: 0;
}

.case-list.collapsed {
  width: 60px;
  box-shadow: 0 0 8px rgba(0,0,0,0.08);
}
.case-list.collapsed .case-list-header span,
.case-list.collapsed .case-list-content,
.case-list.collapsed .pagination-container {
  display: none;
}

.case-list-header {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  letter-spacing: 2px;
  user-select: none;
  
  padding: 12px 24px;
  border-bottom: 1px solid #e0e6f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.toggle-btn {
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

/* 案件卡片样式 */
.case-list-content {
  padding: 12px;
}

.case-card-new {
  background: #f2f6fc;
  border-radius: 14px;
  margin-bottom: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.case-card-new:hover {
  box-shadow: 0 4px 12px rgba(64,158,255,0.15);
  transform: translateY(-2px);
}

.case-card-content {
  padding: 16px;
}

.case-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.case-title {
  font-size: 16px;
  color: #222;
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-icon {
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.favorite-icon:hover {
  background-color: #f0f5ff;
}

.star-icon {
  color: #ffb800;
  font-size: 24px;
}

.case-card-row {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #667085;
  margin-bottom: 8px;
}

.case-tags {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.case-link {
  color: #409eff;
  text-decoration: none;
  white-space: nowrap;
}

/* 分页控件样式 */
.pagination-container {
  padding: 8px;
  background-color: white;
  border-top: 1px solid #ebeef5;
}
.pagination-container .el-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

/* 分隔线样式 */
.divider {
  width: 3px;
  background-color: #f0f5ff;
  transition: width 0.3s ease;
  position: relative;
}

.divider.collapsed::before {
  display: none;
}

/* 案件详情区域样式 */
.case-detail {
  flex: 1;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.case-detail-header {
  padding: 13.5px 24px;
  border-bottom: 1px solid #e0e6f7;
  display: flex;
  align-items: center;
  gap: 16px;
}

.case-title-large {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.action-item {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-item:hover {
  color: #66b1ff;
}

.download-icon {
  color: #409eff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.download-icon:hover {
  transform: scale(1.1);
}

.case-detail-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-bottom: 50px;
  font-size: 15px;
  line-height: 1.8;
  color: #222;
}
</style>