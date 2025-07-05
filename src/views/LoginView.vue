<template>
  <div class="login-bg">
    <div
      style="
        height: 200px;
        width: 200px;
        position: absolute;
        top: 180px;
        left: 170px;
        border-radius: 50%;
        background-color: white;
        box-shadow: 2px 2px 24px 0 rgba(60, 60, 60, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <i class="iconfont icon-falvfagui" style="font-size: 90px; color: #409EFF"></i>
    </div>
    <div style="font-size: 30px; color: #222 ;position: absolute; left: 120px; top: 385px; font-weight: 700;">{{ text.title }}</div>
    <div class="center-box">
      <div class="login-card">
        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 70px">
          <div style="height: 78px; width: 78px; background-color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
            <i class="iconfont icon-faren" style="font-size: 50px; color: #409EFF"></i>
          </div>
        </div>
        <h2 class="welcome">{{ isLogin? text.welcome:text.register }}</h2>
        <el-form :model="form" ref="formRef" class="login-form">
          <el-form-item prop="email">
            <el-input v-model="form.email" :placeholder="text.email" prefix-icon="el-icon-user" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" :placeholder="text.password" prefix-icon="el-icon-key" show-password clearable />
          </el-form-item>
          <el-form-item v-if="!isLogin">
            <el-input v-model="form.confirm" :placeholder="text.confirm" prefix-icon="el-icon-key" show-password clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" @click="isLogin ? onLogin() : onRegister()">{{ isLogin ? text.login : text.register }}</el-button>
          </el-form-item>
        </el-form>
        <div class="signup-tip">
          <span v-if="isLogin">
            {{ text.noAccount }}
            <a class="signup-link" @click="isLogin = false">{{ text.toRegister }}</a>
          </span>
          <span v-else>
            {{ text.hasAccount }}
            <a class="signup-link" @click="isLogin = true">{{ text.toLogin }}</a>
          </span>
        </div>
      </div>
    </div>
    <div class="login-wave"></div>
    <div class="login-circle"></div>
    <div style="position: absolute; left: 40px; top: 30px; z-index: 10; display: flex; align-items: center;">
      <el-switch
        v-model="langSwitch"
        size = "large"
        :active-value="'en'"
        :inactive-value="'zh'"
        style="--el-switch-on-color: #409eff; --el-switch-off-color: #409eff;"
        active-text="English"
        inactive-text="中文"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from "../api/index"
import { useRouter } from 'vue-router'
const validateEmail = (email) => {
  return /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)
}
const validatePassword = (password) => {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/.test(password)
}

export default {
  name: 'LoginView',
  setup() {
    const isLogin = ref(true)
    const form = ref({
      email: '',
      password: '',
      confirm: ''
    })
    const languages = [
      { label: '中文', value: 'zh' },
      { label: 'English', value: 'en' }
    ]
    const lang = ref(localStorage.getItem('lang') || 'zh')
    const langSwitch = computed({
      get: () => lang.value,
      set: v => (lang.value = v)
    })
    watch(lang, (val) => {
      localStorage.setItem('lang', val)
    })
    const text = computed(() => {
      return lang.value === 'zh'
        ? {
            title: '涉外案例查询分析系统',
            welcome: isLogin.value ? '欢迎回来' : '注册',
            email: '注册邮箱',
            password: '密码',
            confirm: '确定密码',
            login: '登录',
            register: '注册',
            noAccount: '还没有账号 ?',
            toRegister: '去注册',
            hasAccount: '已有账号 ?',
            toLogin: '去登录',
            emailError: '请输入正确的邮箱格式',
            pwdNotMatch: '两次密码不一致',
            pwdWeak: '密码需至少8位且包含字母和数字',
            regSuccess: '注册成功',
            loginSuccess: '登录成功',
            language: '选择语言',
            welcomeBack: '欢迎回来',
          }
        : {
            title: 'Foreign Case System',
            welcome: isLogin.value ? 'Welcome back' : 'Sign up',
            email: 'Email',
            password: 'Password',
            confirm: 'Confirm Password',
            login: 'Login',
            register: 'Sign up',
            noAccount: 'No account yet?',
            toRegister: 'Sign up',
            hasAccount: 'Already have an account?',
            toLogin: 'Login',
            emailError: 'Please enter a valid email',
            pwdNotMatch: 'Passwords do not match',
            pwdWeak: 'Password must be at least 8 characters and contain letters and numbers',
            regSuccess: 'Registration successful',
            loginSuccess: 'Login successful',
            language: 'Select Language',
            welcomeBack: 'Welcome back',
          }
    })
    const router = useRouter()
    const onLogin = async() => {
      try {
        const params = {
          email: form.value.email,
          password: form.value.password
        };
        const response = await api.login(params);
        if(response.code === 200) {
          ElMessage.success(text.value.loginSuccess);
          const username = response.data.username || " ";
          const userId = response.data.userId || " ";
          localStorage.setItem('username', username);
          localStorage.setItem('userId', userId);
          sessionStorage.setItem('userEmail', form.value.email);
          sessionStorage.setItem('token', true);
          router.push('/case-query')
        }
      } catch (error) {
        ElMessage.error(text.value.loginFail);
        return;
      }
    }
    const onRegister = async() => {
      if (!validateEmail(form.value.email)) {
        ElMessage.error(text.value.emailError)
        return
      }
      if (form.value.password !== form.value.confirm) {
        ElMessage.error(text.value.pwdNotMatch)
        return
      }
      if (!validatePassword(form.value.password)) {
        ElMessage.error(text.value.pwdWeak)
        return
      }
      try {
        const params = {
          email: form.value.email,
          password: form.value.password
        };
        const response = await api.register(params);
        if (response.code === 200) {
          ElMessage.success(text.value.regSuccess);
          form.value.email = '';
          form.value.password = '';
          form.value.confirm = '';
          isLogin.value = true; // 注册成功后切换到登录状态
        } else {
          ElMessage.error(response.message || '注册失败，请稍后再试');
          return;
        }
      } catch (error) {
        ElMessage.error('注册失败，请稍后再试');
      }
    }
    return {
      isLogin,
      form,
      onLogin,
      onRegister,
      languages,
      lang,
      langSwitch,
      text
    }
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: #f5f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.center-box {
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.login-card {
  width: 370px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 24px 0 rgba(60, 60, 60, 0.1);
  padding: 40px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  position: relative;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 18px;
  object-fit: cover;
  box-shadow: 0 2px 8px #409EFF22;
}
.welcome {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 28px;
  color: #222;
  letter-spacing: 1px;
}
.login-form {
  width: 100%;
}
.login-btn {
  width: 100%;
  font-size: 1.1rem;
  letter-spacing: 1px;
  background: #409EFF;
  border: none;
}
.signup-tip {
  margin-top: 18px;
  color: #888;
  font-size: 0.98rem;
  text-align: center;
}
.signup-link {
  color: #409EFF;
  margin-left: 4px;
  text-decoration: underline;
  cursor: pointer;
}
.system-title {
  margin-top: 24px;
  font-size: 1.1rem;
  color: #409EFF;
  font-weight: bold;
  letter-spacing: 1px;
}
.login-wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100px;
  background: #1890ff;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  z-index: 1;
  clip-path: ellipse(80% 100% at 50% 100%);
}
.login-circle {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 320px;
  height: 320px;
  background: #2196f3;
  border-radius: 50%;
  z-index: 0;
  opacity: 0.7;
}
@media (max-width: 900px) {
  .center-box {
    width: 100vw;
  }
  .login-card {
    margin: 0 auto;
  }
}
</style>
