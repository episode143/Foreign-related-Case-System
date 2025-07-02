<template>
  <div class="home-view">
    <!-- 收藏案件区域 -->
    <div class="favorite-cases" style="margin-bottom: 20px;">
      <div class="section-header">
        <h3 style="font-weight: bold; display: inline-block;">{{ recentFavoritesText }}</h3>
      </div>
      
      <div class="case-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 15px;">
        <div 
          v-for="caseItem in favoriteCases" 
          :key="caseItem.id" 
          class="case-card"
          @click="goToCaseDetail(caseItem.id)"
          style="background-color: white; border-radius: 12px; border: 1px solid #e5e9f2; padding: 15px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: transform 0.3s ease;"
          :style="{ transform: 'translateY(0)', ':hover': { transform: 'translateY(-5px)' }}"
        >
          <h4 style="font-size: 16px; font-weight: 500; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ caseItem.title }}</h4>
          <div style="display: flex; font-size: 12px; color: #667085; margin-bottom: 10px;">
            <span style="margin-right: 15px;"><i class="iconfont icon-court" style="margin-right: 5px;"></i>{{ caseItem.court }}</span>
            <span><i class="iconfont icon-date" style="margin-right: 5px;"></i>{{ caseItem.date }}</span>
          </div>
          <div style="font-size: 12px; color: #4e5969; line-height: 1.5; display: -webkit-box;  -webkit-box-orient: vertical; overflow: hidden;">
            {{ caseItem.tags }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-area" style="background-color: transparent; padding: 70px 0;">
      <div style="border-radius: 15px; border: 1px solid #ddd; padding: 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- 筛选条件 -->
        <div class="filter-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
          <el-date-picker
            v-model="filter.date"
            :placeholder="timePlaceholderText"
            style="width: 120px;"
            :type="dateType"
          />
          <el-input 
            v-model="filter.court" 
            :placeholder="courtPlaceholderText" 
            style="width: 150px;"
          />
            <el-input 
            v-model="filter.country" 
            :placeholder="countryPlaceholderText"
            style="width: 150px;"
          />
          <el-input 
            v-model="filter.nature" 
            :placeholder="naturePlaceholderText"  
            style="width: 150px;"
          />
          
          <el-button @click="resetFilters" style="height: 34px; padding: 0 12px; line-height: 34px; font-size: 12px;">
            {{ resetButtonText }}
          </el-button>
        </div>
        
        <!-- 搜索输入框 -->
        <div style="position: relative;">
          <el-input 
            v-model="searchText" 
            type="textarea" 
            :placeholder="searchPlaceholderText"
            class="fixed-height-textarea"
            :rows="5" 
            :autosize="false"  
          />
          <button 
            @click="searchCases" 
            style="
              position: absolute;
              right: 5px;
              bottom: 5px;
              background-color: #3a8ee6;
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              color: white;
            "
          >
            <i class="iconfont icon-sousuo" style="font-size: 20px;"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed  } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';

export default {
  name: 'HomeView',
  setup() {
    const store = useStore();
    const router = useRouter();
    const searchText = ref("");
    const filter = ref({
      date: "",
      court: "",
      country: "",
      nature: ""
    });
    const lang = computed(() => store.getters.lang);

    const recentFavoritesText = computed(() => {
      return lang.value === 'zh' ? '最近收藏' : 'Recently Favorited';
    });

    const timePlaceholderText = computed(() => {
      return lang.value === 'zh' ? '请选择时间' : 'choose time';
    });

    const courtPlaceholderText = computed(() => {
      return lang.value === 'zh' ? '请输入法院名称' : 'Enter court name';
    });

    const countryPlaceholderText = computed(() => {
      return lang.value === 'zh' ? '请输入国家' : 'Enter country';
    });

    const naturePlaceholderText = computed(() => {
      return lang.value === 'zh' ? '请输入案件性质' : 'Enter case nature';
    });

    const resetButtonText = computed(() => {
      return lang.value === 'zh' ? '重置' : 'Reset';
    });

    const searchPlaceholderText = computed(() => {
      return lang.value === 'zh' ? '请输入您想查询案件的关键字，可输入案件名称、当事人、案号等' : 'Enter keywords to search for cases, such as case names, parties, case numbers, etc.';
    });
    
    // 收藏案件数据
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
    ]);
    
    // 跳转到案件详情页
    const goToCaseDetail = (caseId) => {
      console.log("跳转到案件详情页:", caseId);
      router.push("/case-query/favorite");
    };
    
    // 搜索案件
    const searchCases = () => {
      // 组合搜索条件
      const searchParams = {
        keyword: searchText.value,
        date: filter.value.date === "全部年份" ? "" : filter.value.date,
        court: filter.value.court,
        country: filter.value.country,
        nature: filter.value.nature
      };
      
      // 执行搜索逻辑
      console.log("搜索案件:", searchParams);
      // 这里可以调用API或路由到搜索结果页
      router.push("/case-query/search");
    };

    // 重置筛选条件
    const resetFilters = () => {
      filter.value = {
        date: "",
        court: "",
        country: "",
        nature: ""
      };
      searchText.value = "";
    };
    
    
    return {
      searchText,
      filter,
      favoriteCases,
      goToCaseDetail,
      searchCases,
      resetFilters,
      recentFavoritesText,
      timePlaceholderText,
      courtPlaceholderText,
      countryPlaceholderText,
      naturePlaceholderText,
      resetButtonText,
      searchPlaceholderText
    };
  }
}
</script>

<style scoped>
.home-view {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.case-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
</style>