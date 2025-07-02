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
            <i class="iconfont icon-sousuo2" style="font-size: 23px;"></i>
            <span v-if="!collapsed" style="margin-left: 15px; font-size: 15px;">{{ lang === "zh" ? "搜索案例" : "Search Cases" }}</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="iconfont icon-shoucang_shixin" style="font-size: 23px;"></i>
            <span v-if="!collapsed" style="margin-left: 15px; font-size: 15px;">{{ lang === "zh" ? "收藏案件" : "Favorites" }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header-bar">
          <div class="header-title">
            <span style="font-size: 18px;margin-left: 23px;">{{ lang === "zh" ? "涉外案例查询分析系统" : "Foreign Case Query & Analysis System" }}</span>
          </div>
          <div class="header-actions">
            <el-switch v-model="lang" :active-value="'en'" :inactive-value="'zh'" active-text="EN" inactive-text="中文" style="margin-right: 24px" @change="changeLang" />
            <el-dropdown trigger="hover" placement="bottom-end">
              <span class="avatar-dropdown" style="display: inline-block">
                <div style="height: 32px; width: 32px; border-radius: 50%; background-color: #1883ff; display: flex; justify-content: center; align-items: center">
                  <i class="iconfont icon-yonghu" style="font-size: 20px; color: white; border: none"></i>
                </div>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>
                    {{ userEmail }}
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="logout">
                    {{ lang === "zh" ? "退出登录" : "Logout" }}
                  </el-dropdown-item>
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
import { Menu} from "@element-plus/icons-vue";
import { useStore } from 'vuex';

export default {
  components: {
    Menu,
  },
  setup() {
    const collapsed = ref(true);
    const activeMenu = ref("1");
    const router = useRouter();
    const route = useRoute();
    const userEmail = ref(sessionStorage.getItem("userEmail") || "");
    const store = useStore();
    const lang = computed(() => store.getters.lang);
    const changeLang = (val) => {
      //localStorage.setItem("lang", val);
      store.commit('setLang', val);
    };

    const logout = () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");
      router.push("/login");
    };

    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      if (index === "1") {
        router.push("/case-query/home");
      } else if (index === "2") {
        router.push("/case-query/favorite");
      }
    };

    // 路由与菜单编号的映射
    const pathToMenu = (path) => {
      if (path.includes("/case-query/favorite")) return "2";
      return "1";
    };

    // 路由变化时同步菜单高亮
    watch(
      () => route.path,
      (newPath) => {
        activeMenu.value = pathToMenu(newPath);
      },
      { immediate: true }
    );

    onMounted(() => {
      lang.value = localStorage.getItem("lang") || "zh";
      userEmail.value = sessionStorage.getItem("userEmail") || "";
      // 根据当前路由设置菜单高亮
      if (router.currentRoute.value.path.includes("/case-query/favorite")) {
        activeMenu.value = "2";
      } else {
        activeMenu.value = "1";
      }
    });

    return {
      collapsed,
      lang,
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
  background: #F5F7FA;
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
  color: #409EFF;
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
::v-deep .el-menu-item {
  border-radius: 10px;
  overflow: hidden;
}
</style>
