<template>
  <div class="search-grid-container">
    <div style="grid-area: input-area; background-color: transparent">
      <div style="width: 100%; height: 85%; background-color: white; border-radius: 15px; border: 1px solid rgb(177.3, 179.4, 183.6); position: relative">
        <button
          style="
            position: absolute;
            right: 6px;
            bottom: 5px;
            z-index: 10;
            background-color: rgb(121.3, 187.1, 255);
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
          placeholder="请输入您想查询案件的关键字"
        />
      </div>
    </div>
    <div class="case-list-area">
      <el-scrollbar style="width: 100%; height: 480px">
        <div class="case-list-flex">
          <div v-for="item in pagedCases" :key="item.id" class="case-card-new">
            <div class="case-card-content">
              <div class="case-card-header">
                <i class="iconfont icon-xiaofadianwenzhang" style="font-size: 32px; color: #333; margin-right: 10px"></i>
                <span class="case-title">{{ item.title }}</span>
              </div>
              <div class="case-card-row">
                <span class="case-country">{{ item.country }}</span>
                <span class="case-court">{{ item.court }}</span>
                <span class="case-date">{{ item.date }}</span>
              </div>
              <div class="case-card-row">
                <span class="case-tags">标签：{{ item.tags }}</span>
                <a href="#" class="case-link">查看</a>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div style="padding: 8px 0; display: flex; justify-content: center; width: 100%">
        <el-pagination size="small" layout="prev, pager, next" :total="cases.length" :page-size="6" v-model:current-page="page" />
      </div>
    </div>
    <div style="grid-area: case-content-area">
      <!-- 顶部栏 -->
      <div
        style="
          width: 100%;
          border-top-left-radius: 15px;
          border-top-right-radius: 15px;
          height: 50px;
          position: relative;
          background-color: white;
          border: 1px solid rgb(177.3, 179.4, 183.6);
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: bold;
        "
      >
      </div>
      <!-- 内容区 -->
      <div
        style="
          width: 100%;
          border: 1px solid rgb(177.3, 179.4, 183.6);
          border-top: none;
          height: 545px;
          background-color: white;
          border-bottom-right-radius: 15px;
          border-bottom-left-radius: 15px;
          padding: 24px 32px 0 32px;
          box-sizing: border-box;
          overflow-y: auto;
        "
      >
        <div v-html="caseDetailHtml"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import MarkdownIt from "markdown-it";

export default {
  name: "SearchCases",
  setup() {
    const textarea = ref("");
    const page = ref(1);
    // 示例数据
    const cases = ref([
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
        title: "案例2",
        country: "中国",
        court: "北京市中级法院",
        date: "2024.12.1",
        tags: "合同纠纷",
      },
      {
        id: 3,
        title: "案例3",
        country: "英国",
        court: "伦敦高等法院",
        date: "2024.11.1",
        tags: "侵权",
      },
      {
        id: 4,
        title: "案例4",
        country: "法国",
        court: "巴黎地方法院",
        date: "2024.10.1",
        tags: "知识产权",
      },
      {
        id: 5,
        title: "案例5",
        country: "德国",
        court: "柏林法院",
        date: "2024.9.1",
        tags: "劳动争议",
      },
      {
        id: 6,
        title: "案例6",
        country: "日本",
        court: "东京地方法院",
        date: "2024.8.1",
        tags: "交通事故",
      },
      {
        id: 7,
        title: "案例7",
        country: "韩国",
        court: "首尔法院",
        date: "2024.7.1",
        tags: "医疗纠纷",
      },
    ]);
    const pagedCases = computed(() => {
      const start = (page.value - 1) * 6;
      return cases.value.slice(start, start + 6);
    });

    // 假设后端返回的 markdown 数据
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

    return {
      textarea,
      page,
      cases,
      pagedCases,
      caseDetailHtml
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
  grid-template-columns: 1fr 12fr 1fr 24fr 1fr;
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
  border-radius: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  width: 100%;
  min-width: 460px;
  max-width: 100%;
  height: 100px;
  margin-bottom: -2px;
  padding: 18px 24px 12px 18px;
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
  font-weight: bold;
  font-size: 18px;
  color: #222;
}
.case-card-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 2px;
}
.case-country {
  font-size: 16px;
  color: #222;
  font-weight: light;
  margin-right: 24px;
}
.case-court {
  font-size: 16px;
  color: #222;
  font-weight: light;
  margin-right: 24px;
}
.case-date {
  font-size: 16px;
  color: #222;
  font-weight: light;
  margin-left: auto;
}
.case-tags {
  font-size: 16px;
  color: #222;
  font-weight: light;
}
.case-link {
  float: right;
  color: #1883ff;
  font-size: 18px;
  font-weight: bold;
  margin-left: auto;
  text-decoration: none;
}
.case-link:hover {
  text-decoration: underline;
}
</style>
