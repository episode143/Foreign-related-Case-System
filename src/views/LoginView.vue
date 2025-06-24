<template>
  <div class="login-bg">
    <div class="login-left">
      <el-icon class="login-icon" style="font-size: 80px; color: #1883ff;"><UserFilled /></el-icon>
      <div class="login-left-title">涉外案例查询和分析系统</div>
    </div>
    <div class="login-card">
      <img class="avatar" src="https://img2.baidu.com/it/u=1812345678,1234567890&fm=253&fmt=auto&app=138&f=JPEG?w=200&h=200" alt="avatar">
      <h2 class="welcome">Welcome back</h2>
      <el-form :model="loginForm" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="username" prefix-icon="el-icon-user" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="password" prefix-icon="el-icon-key" show-password clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="onLogin">LOGIN</el-button>
        </el-form-item>
      </el-form>
      <div class="signup-tip">
        Don't have an account ?
        <router-link to="/register" class="signup-link">signup</router-link>
      </div>
    </div>
    <div class="login-wave"></div>
    <div class="login-circle"></div>
  </div>
</template>

<script>
import { UserFilled} from '@element-plus/icons-vue'
export default {
  name: 'LoginView',
  components: { UserFilled },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    onLogin() {
      this.$message.success('登录成功（示例）')
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
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.login-icon {
  margin-bottom: 16px;
  filter: drop-shadow(2px 4px 8px #1883ff44);
}
.login-left-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #222;
  margin-top: 12px;
  text-shadow: 2px 4px 8px #00000022;
  letter-spacing: 2px;
}
.login-card {
  width: 370px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 24px 0 rgba(60,60,60,0.10);
  padding: 40px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 18px;
  object-fit: cover;
  box-shadow: 0 2px 8px #1883ff22;
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
  background: #1883ff;
  border: none;
}
.signup-tip {
  margin-top: 18px;
  color: #888;
  font-size: 0.98rem;
  text-align: center;
}
.signup-link {
  color: #1883ff;
  margin-left: 4px;
  text-decoration: underline;
}
.login-wave {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 140px;
  background: #1890ff;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  z-index: 1;
  clip-path: ellipse(80% 100% at 50% 100%);
}
.login-circle {
  position: absolute;
  top: -120px; right: -120px;
  width: 320px; height: 320px;
  background: #2196f3;
  border-radius: 50%;
  z-index: 0;
  opacity: 0.7;
}
@media (max-width: 900px) {
  .login-bg {
    flex-direction: column;
  }
  .login-left {
    margin-bottom: 32px;
  }
}
</style>
