import { createApp } from 'vue'; // Vue 3 的入口方法
import App from './App.vue';
// 路由
import router from './router';
// 字体库
import 'font-awesome/css/font-awesome.min.css';
// ajax封装好的库，专门用来发送异步请求
import axios from 'axios';
// qs 是一个用于序列化和反序列化查询字符串的库
import qs from 'qs';
// 通用的工具类，'./common.js'，多个方法，导入了对象
import {
	getCurDate,
	setSessionStorage,
	getSessionStorage,
	removeSessionStorage,
	setLocalStorage,
	getLocalStorage,
	removeLocalStorage,
} from './common.js';

// 创建 Vue 3 应用实例
const app = createApp(App);

// 配置 axios 的基础 URL
axios.defaults.baseURL = 'http://localhost:9000/consumer/';

// 添加axios响应拦截器来处理熔断错误
axios.interceptors.response.use(
    response => {
        console.log('=== Axios响应拦截器 - 成功回调 ===');
        console.log('状态码:', response.status);
        console.log('响应数据:', response.data);
        console.log('完整响应对象:', response);
        
        // 检查是否是熔断错误 - 注意ResponseResult使用的是message字段，不是msg
        const data = response.data;
        if (data && 
            (data.code === 503 || 
             (data.message && data.message.includes('呃呃...服务器忙中...')) ||
             (data.message && (data.message.includes('服务降级') || 
                              data.message.includes('熔断') ||
                              data.message.includes('Circuit breaker'))))) {
            console.log('🔥 检测到熔断错误，立即跳转到降级页面');
            console.log('当前路径:', window.location.pathname + window.location.search);
            
            const currentPath = window.location.hash.replace('#', '') || '/';
            console.log('准备跳转到fallback页面，原始路径:', currentPath);
            
            // 使用hash模式的URL格式
            console.log('🚀 开始跳转到降级页面...');
            window.location.href = '#/fallback?originalPath=' + encodeURIComponent(currentPath);
            
            return Promise.reject(new Error('服务熔断'));
        }
        return response;
    },
    error => {
        console.log('=== Axios错误拦截器触发 ===');
        console.log('错误对象:', error);
        console.log('错误类型:', error.constructor.name);
        console.log('错误代码:', error.code);
        console.log('错误消息:', error.message);
        
        // 处理网络错误或服务不可用
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            const message = data?.message || data?.msg || error.message;
            
            console.log('=== 响应错误详情 ===');
            console.log('HTTP状态码:', status);
            console.log('错误消息:', message);
            console.log('响应数据:', data);
            console.log('完整响应:', error.response);
            
            // 检查是否是熔断相关的错误 - 503状态码或特定消息
            if (status === 503 || status === 500 || 
                (message && (message.includes('呃呃...服务器忙中...') ||
                            message.includes('服务降级') || 
                            message.includes('熔断') ||
                            message.includes('Circuit breaker')))) {
                console.log('🔥 检测到服务不可用错误，立即跳转到降级页面');
                console.log('当前路径:', window.location.pathname + window.location.search);
                
                const currentPath = window.location.hash.replace('#', '') || '/';
                console.log('准备跳转到fallback页面，原始路径:', currentPath);
                
                // 使用hash模式的URL格式
                console.log('🚀 开始跳转到降级页面...');
                window.location.href = '#/fallback?originalPath=' + encodeURIComponent(currentPath);
                
                return Promise.reject(new Error('服务熔断'));
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            // 超时错误也跳转到熔断页面
            console.log('🔥 检测到超时错误，立即跳转到降级页面');
            console.log('当前路径:', window.location.pathname + window.location.search);
            
            const currentPath = window.location.hash.replace('#', '') || '/';
            console.log('准备跳转到fallback页面，原始路径:', currentPath);
            
            console.log('🚀 开始跳转到降级页面...');
            window.location.href = '#/fallback?originalPath=' + encodeURIComponent(currentPath);
            
            return Promise.reject(new Error('请求超时'));
        } else {
            console.log('=== 网络错误或其他错误 ===');
            console.log('错误详情:', error);
        }
        
        return Promise.reject(error);
    }
);

// 将 axios 和 qs 挂载到全局实例上
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$qs = qs;

// 将常用的工具方法挂载到全局实例上
app.config.globalProperties.$getCurDate = getCurDate;
app.config.globalProperties.$setSessionStorage = setSessionStorage;
app.config.globalProperties.$getSessionStorage = getSessionStorage;
app.config.globalProperties.$removeSessionStorage = removeSessionStorage;
app.config.globalProperties.$setLocalStorage = setLocalStorage;
app.config.globalProperties.$getLocalStorage = getLocalStorage;
app.config.globalProperties.$removeLocalStorage = removeLocalStorage;

// 配置全局路由守卫
router.beforeEach((to, from, next) => {
	const user = sessionStorage.getItem('user');
	
	// fallback页面不需要登录验证，直接通过
	if (to.path === '/fallback') {
		next();
		return;
	}
	
	// 除了登录、注册、首页、商家列表、商家信息、fallback之外，都需要判断是否登录
	if (
		!(
			to.path === '/' ||
			to.path === '/index' ||
			to.path === '/businessList' ||
			to.path === '/businessInfo' ||
			to.path === '/login' ||
			to.path === '/register' ||
			to.path === '/fallback'
		)
	) {
		if (user == null) {
			// 保存原始要去的路径，以便登录后跳回
			next({
				path: '/login',
				query: { redirect: to.fullPath }
			});
			return;
		}
	}
	next();
});

// 挂载路由和应用实例
app.use(router).mount('#app');
