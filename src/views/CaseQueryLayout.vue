<template>
  <div class="common-layout">
    <el-container>
      <el-aside :width="collapsed ? '64px' : '160px'" class="aside-bar">
        <div class="menu-toggle" @click="collapsed = !collapsed">
          <el-icon><Menu /></el-icon>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          background-color="#F5F7FA"
          text-color="#909399"
          active-text-color="#409EFF"
          :collapse="collapsed"
          @select="handleMenuSelect"
        >
          <el-menu-item index="1">
            <i class="iconfont icon-sousuo2" style="font-size: 26px"></i>
            <span v-if="!collapsed" style="margin-left: 15px; font-size: 15px">{{
              lang === "zh" ? "搜索案例" : "Search Cases"
            }}</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="iconfont icon-shoucang_shixin" style="font-size: 25px"></i>
            <span v-if="!collapsed" style="margin-left: 15px; font-size: 15px">{{
              lang === "zh" ? "收藏案件" : "Favorites"
            }}</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="iconfont icon-lishixiao1" style="font-size: 20px;margin-left: 1px;"></i>
            <span v-if="!collapsed" style="margin-left: 15px; font-size: 15px">{{
              lang === "zh" ? "历史记录" : "History"
            }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header-bar">
          <div class="header-title">
            <span style="font-size: 18px; margin-left: 23px">{{
              lang === "zh" ? "涉外案例查询分析系统" : "Foreign Case Query & Analysis System"
            }}</span>
          </div>
          <div class="header-actions">
            <el-switch
              v-model="switchLang" 
              :active-value="'en'"
              :inactive-value="'zh'"
              active-text="EN"
              inactive-text="中文"
              style="margin-right: 24px"
              @change="changeLang"
            />
            <el-dropdown trigger="hover" placement="bottom-end">
              <span class="avatar-dropdown" style="display: inline-block">
                <div style="height: 32px; width: 32px; border-radius: 50%; background-color: #1883ff; display: flex; justify-content: center; align-items: center">
                  <i class="iconfont icon-yonghu" style="font-size: 20px; color: white; border: none"></i>
                </div>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>{{ userEmail }}</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">{{ lang === "zh" ? "退出登录" : "Logout" }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Menu } from "@element-plus/icons-vue";
import { useStore } from "vuex";

export default {
  components: {
    Menu,
  },
  setup() {
    // =============================
    // ✅ 响应式变量定义
    // =============================
    const collapsed = ref(true);
    const activeMenu = ref("1");
    const userEmail = ref(sessionStorage.getItem("userEmail") || "");

    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    // =============================
    // ✅ 计算属性 (lang 依然是只读的，它仅用于显示文本)
    // =============================
    const lang = computed(() => store.getters.lang);

    const switchLang = ref(store.getters.lang); 

    watch(lang, (newLang) => {
      switchLang.value = newLang;
    }, { immediate: true }); // immediate: true 确保组件挂载时立即执行一次，设置初始值

    // =============================
    // ✅ 初始化方法
    // =============================
    const initApp = () => {
      userEmail.value = sessionStorage.getItem("userEmail") || "";
      activeMenu.value = pathToMenu(route.path);
    };

    // =============================
    // ✅ 菜单相关逻辑
    // =============================
    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      if (index === "1") {
        router.push("/case-query/home");
      } else if (index === "2") {
        router.push("/case-query/favorite");
      } else if (index === "3") {
        router.push("/case-query/history");
      }
    };

    const pathToMenu = (path) => {
      if (path.includes("/case-query/favorite")) return "2";
      if (path.includes("/case-query/history")) return "3";
      return "1";
    };

    // =============================
    // ✅ 语言切换逻辑
    // =============================
    const changeLang = (val) => {
      store.commit("setLang", val); // 将新的语言值提交到 Vuex store
    };

    // =============================
    // ✅ 登出逻辑
    // =============================
    const logout = () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");
      router.push("/login");
    };

    // =============================
    // ✅ 路由监听逻辑
    // =============================
    watch(
      () => route.path,
      (newPath) => {
        activeMenu.value = pathToMenu(newPath);
      },
      { immediate: true }
    );

    // =============================
    // ✅ 生命周期
    // =============================
    onMounted(() => {
      initApp();
    });

    // =============================
    // ✅ 返回模板所需数据
    // =============================
    return {
      collapsed,
      lang,         // lang 仍然暴露给模板，用于显示文本（例如菜单项的文本），因为它仍然是一个有用的只读值。
      switchLang,   // 新增：暴露给 el-switch 的 v-model。
      activeMenu,
      changeLang,
      userEmail,
      logout,
      handleMenuSelect,
    };
  },
};
</script>

<style scoped>
.common-layout {
  height: 100vh;
  width: 100vw;
  background: #fff;
}
.aside-bar {
  background: #f5f7fa;
  color: #fff;
  position: relative;
  transition: width 0.2s;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 0;
}
.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  cursor: pointer;
  color: #409eff;
  font-size: 20px;
}
.el-menu-vertical-demo {
  border-right: none;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  height: 64px;
  padding: 0 24px;
  border-bottom: none;
}
.header-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #222;
}
.header-actions {
  display: flex;
  align-items: center;
}
.main-content {
  background: #fff;
  min-height: calc(100vh - 64px);
  padding: 0;
}
/* 这里保留了 ::v-deep，但 Vue 3 推荐使用 :deep() 伪类选择器，你可以考虑更新 */
::v-deep .el-menu-item {
  border-radius: 10px;
  overflow: hidden;
}
</style>