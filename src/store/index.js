import { createStore } from 'vuex'

export default createStore({
  state: {
    lang: 'zh', // 当前语言设置
    searchParams: {
      keyword: '',   // 搜索关键字
      period: '',    // 时间范围
      country: '',   // 国家
    },
    // 新增：收藏夹页面的搜索参数状态
    favoriteSearchParams: {
      pagenum: 1, // 收藏夹页码，默认为第一页
      selectedIndex: -1, // 当前选中收藏案例的索引 (相对于当前页的 cases 数组)，默认为0
    }
  },
  getters: {
    lang: state => state.lang, // 获取当前语言
    searchParams: state => state.searchParams, // 获取主搜索页参数
    favoriteSearchParams: state => state.favoriteSearchParams // 获取收藏夹页参数
  },
  mutations: {
    setLang(state, lang) {
      state.lang = lang // 设置语言
      state.searchParams.language = lang;
    },
    setSearchParams(state, params) {
      state.searchParams = { ...state.searchParams, ...params };
      state.searchParams.language = state.lang;
    },
    setSearchKeyword(state, keyword) {
      state.searchParams.keyword = keyword;
    },
    setSearchPeriod(state, period) {
      state.searchParams.period = period;
    },
    setSearchCountry(state, country) {
      state.searchParams.country = country;
    },

    // 新增：收藏夹页面的 mutations
    setFavoriteSearchPagenum(state, pagenum) {
      state.favoriteSearchParams.pagenum = pagenum;
    },
    setFavoriteSearchSelectedIndex(state, selectedIndex) {
      state.favoriteSearchParams.selectedIndex = selectedIndex;
    },

    // 允许一次性设置多个收藏夹搜索参数
    setFavoriteSearchParams(state, params) {
      state.favoriteSearchParams = { ...state.favoriteSearchParams, ...params };
    },
  },
  actions: {
  },
  modules: {
  }
})