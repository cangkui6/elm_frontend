<template>
  <div class="fallback-container">
    <div class="fallback-content">
      <!-- 困惑的机器人图标 -->
      <div class="robot-icon">
        <div class="face">
          <div class="eyes">
            <div class="eye left">></div>
            <div class="eye right"><</div>
          </div>
          <div class="mouth">〜</div>
        </div>
        <div class="body"></div>
      </div>
      
      <!-- 错误信息 -->
      <div class="error-message">
        呃呃...服务器忙中...
      </div>
      
      <!-- 重试次数提示 -->
      <div v-if="showRetryLimit" class="retry-warning">
        已重试 {{ retryCount }} 次，服务可能暂时不可用
      </div>
      
      <!-- 返回重试按钮 -->
      <div class="button-group">
        <button class="retry-btn" @click="handleRetry">
          返回重试 {{ retryCount > 0 ? `(${retryCount})` : '' }}
        </button>
        
        <button v-if="showRetryLimit" class="reset-btn" @click="resetRetryCount">
          重置计数
        </button>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item" @click="goHome">
        <i class="fa fa-home"></i>
        <span>首页</span>
      </div>
      <div class="nav-item">
        <i class="fa fa-search"></i>
        <span>发现</span>
      </div>
      <div class="nav-item">
        <i class="fa fa-list-alt"></i>
        <span>订单</span>
      </div>
      <div class="nav-item">
        <i class="fa fa-user"></i>
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircuitBreakerFallback',
  data() {
    return {
      originalPath: this.$route.query.originalPath || '/',
      errorMessage: this.$route.query.errorMessage || '呃呃...服务器忙中...',
      retryCount: 0,
      showRetryLimit: false
    }
  },
  methods: {
    handleRetry() {
      // 记录重试次数
      this.retryCount = parseInt(sessionStorage.getItem('circuitBreakerRetryCount') || '0') + 1;
      sessionStorage.setItem('circuitBreakerRetryCount', this.retryCount.toString());
      
      // 显示重试次数提示，但不强制跳转
      if (this.retryCount > 3) {
        this.showRetryLimit = true;
        // 给用户提示，但仍然允许重试
        console.log(`已重试 ${this.retryCount} 次，服务可能仍然不可用`);
      }
      
      // 返回原来的页面或路由
      if (this.originalPath && this.originalPath !== '/fallback') {
        this.$router.push(this.originalPath);
      } else {
        // 如果没有原始路径，返回上一页
        this.$router.go(-1);
      }
    },
    
    goHome() {
      sessionStorage.removeItem('circuitBreakerRetryCount');
      this.$router.push('/');
    },
    
    // 新增：重置重试计数
    resetRetryCount() {
      sessionStorage.removeItem('circuitBreakerRetryCount');
      this.retryCount = 0;
      this.showRetryLimit = false;
    }
  },
  
  mounted() {
    // 获取当前重试次数
    this.retryCount = parseInt(sessionStorage.getItem('circuitBreakerRetryCount') || '0');
    if (this.retryCount > 3) {
      this.showRetryLimit = true;
    }
    
    // 5秒后自动重试（但不超过5次自动重试）
    if (this.retryCount < 5) {
      setTimeout(() => {
        this.handleRetry();
      }, 5000);
    }
  }
}
</script>

<style scoped>
.fallback-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
}

.fallback-content {
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 机器人图标样式 */
.robot-icon {
  width: 120px;
  height: 140px;
  margin: 0 auto 30px;
  position: relative;
}

.face {
  width: 80px;
  height: 80px;
  background: #e8e8e8;
  border: 3px solid #ccc;
  border-radius: 15px;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.face::before,
.face::after {
  content: '';
  position: absolute;
  top: -8px;
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
}

.face::before {
  left: 20px;
}

.face::after {
  right: 20px;
}

.eyes {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
}

.eye {
  font-size: 18px;
  color: #666;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 90%, 100% { opacity: 1; }
  95% { opacity: 0.3; }
}

.mouth {
  font-size: 16px;
  color: #666;
  margin-top: 5px;
}

.body {
  width: 60px;
  height: 40px;
  background: #f0f0f0;
  border: 2px solid #ccc;
  border-radius: 8px;
  margin: 8px auto 0;
  position: relative;
}

.body::before,
.body::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 15px;
  height: 3px;
  background: #ccc;
  border-radius: 2px;
  transform: translateY(-50%);
}

.body::before {
  left: -18px;
}

.body::after {
  right: -18px;
}

.error-message {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
  font-weight: 500;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.retry-warning {
  font-size: 14px;
  color: #ff9800;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.button-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.retry-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 16px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  font-weight: 500;
}

.retry-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.retry-btn:active {
  transform: translateY(0);
}

.reset-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 14px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
  font-weight: 500;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s ease;
  color: #999;
}

.nav-item:hover {
  color: #0097FF;
}

.nav-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-item span {
  font-size: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .fallback-content {
    padding: 0 20px;
  }
  
  .robot-icon {
    width: 100px;
    height: 120px;
  }
  
  .face {
    width: 70px;
    height: 70px;
  }
  
  .error-message {
    font-size: 16px;
  }
  
  .retry-btn {
    padding: 12px 30px;
    font-size: 14px;
  }
}
</style> 