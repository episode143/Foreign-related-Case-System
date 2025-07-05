import { createStore } from 'vuex'

export default createStore({
  state: {
    lang: 'zh', // 当前语言设置
    // 新增：搜索参数状态
    searchParams: {
      keyword: '',   // 搜索关键字
      language: '',  // 语言 (会根据 lang getter 动态设置，但在此处初始化)
      period: '',    // 时间范围
      country: '',   // 国家
      pagenum: 1,    // 页码，默认为第一页
      pagesize: 6   // 每页大小，默认为6条
    }
  },
  getters: {
    lang: state => state.lang, // 获取当前语言
    searchParams: state => state.searchParams // 获取搜索参数
  },
  mutations: {
    setLang(state, lang) {
      state.lang = lang // 设置语言
      // 当语言改变时，也更新 searchParams 中的 language 字段
      state.searchParams.language = lang;
    },
    // 新增：设置搜索参数的mutation
    setSearchParams(state, params) {
      // 合并传入的参数，确保覆盖现有参数但保留未传入的参数
      state.searchParams = { ...state.searchParams, ...params };
      // 确保 language 参数始终与当前的 lang getter 保持一致
      state.searchParams.language = state.lang;
    },
    // 单独设置某个搜索参数的mutation（可选，但通常更灵活）
    setSearchKeyword(state, keyword) {
      state.searchParams.keyword = keyword;
    },
    setSearchPeriod(state, period) {
      state.searchParams.period = period;
    },
    setSearchCountry(state, country) {
      state.searchParams.country = country;
    },
    setSearchPagenum(state, pagenum) {
      state.searchParams.pagenum = pagenum;
    },
    setSearchPagesize(state, pagesize) {
      state.searchParams.pagesize = pagesize;
    }
  },
  actions: {
    // 可以在这里添加异步操作，例如从 API 获取数据并提交 mutations
  },
  modules: {
  }
})