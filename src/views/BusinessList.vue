<template>
   <div class="wrapper">
			
			<!-- header部分 -->
			<header>
				<p>商家列表</p>
			</header>
			
			<!-- 商家列表部分 -->
			<ul class="business">
				<li v-for="item in businessArray" @click="toBusinessInfo(item.businessId)">
					<div class="business-img">
						<img :src="item.businessImg">
						<div class="business-img-quantity" v-show="item.quantity && item.quantity > 0">{{item.quantity}}</div>
					</div>
					<div class="business-info">
						<h3>{{item.businessName}}</h3>
						<p>&#165;{{item.starPrice}}起送 | &#165;{{item.deliveryPrice}}配送</p>
						<p>{{item.businessExplain}}</p>
					</div>
				</li>
			</ul>
            <!-- 底部菜单部分 -->
	        <Footer></Footer>
   </div>
</template>

<script>
import Footer from '../components/Footer.vue'
// 模块导出
export default {
    data(){
        return {
			// 获取到由index.vue传来的categoryId
            orderTypeId:this.$route.query.categoryId,
            businessArray:[],
			user:{},
        }
    },
	// vue中初始化的方法，自动调用
    created() {
		this.user = this.$getSessionStorage('user');
        
        // 使用consumer服务获取商家列表
        this.$axios.get('businesses', {
            params: {
                orderTypeId: this.orderTypeId,
                userId: this.user ? this.user.userId : null
            }
        }).then(response => {
            console.log("获取到的商家数据:", response.data);
            
            if (response.data.code === 200 && response.data.data) {
                this.businessArray = response.data.data;
                
                // 打印获取到的商家数量
                console.log(`获取到 ${this.businessArray.length} 个商家`);
                
                // 列出所有获取到的商家
                if (this.businessArray.length > 0) {
                    console.log("商家列表:");
                    this.businessArray.forEach((business, index) => {
                        console.log(`${index+1}. ID: ${business.businessId}, 名称: ${business.businessName}`);
                    });
                }
            } else {
                console.warn("未获取到商家数据或返回错误");
            }
        }).catch(error => {
            console.log("获取商家列表失败:", error);
        });
    },
	methods: {
		toBusinessInfo(businessId) {
			// 跳转页面
			 this.$router.push({
                path:'/businessInfo',
                query:{
                    businessId:businessId
                }
            });
		},
        
        // 单独获取购物车数量
        getCartQuantities() {
            if (!this.user || !this.user.userId) {
                console.log("用户未登录，不获取购物车数量");
                return;
            }
            
            console.log("开始获取购物车数量 - userId:", this.user.userId);
            
            // 调用后端专门的购物车数量接口
            this.$axios.post('/cart/getCartQuantityMap', this.$qs.stringify({
                userId: this.user.userId
            })).then(response => {
                console.log("购物车数量数据:", response.data);
                
                if (response.data.code === 200 && response.data.data) {
                    // 获取到的是一个映射，其中key是商家ID，value是数量
                    const quantityMap = response.data.data;
                    console.log("购物车数量映射:", quantityMap);
                    
                    // 商家ID可能从后端返回为字符串，在这里先打印商家ID和购物车数量的类型
                    Object.keys(quantityMap).forEach(businessId => {
                        console.log(`商家ID ${businessId} (类型: ${typeof businessId}) 的购物车数量: ${quantityMap[businessId]} (类型: ${typeof quantityMap[businessId]})`);
                    });
                    
                    // 打印商家列表中的商家ID类型
                    this.businessArray.forEach(business => {
                        console.log(`商家列表中的商家: ID ${business.businessId} (类型: ${typeof business.businessId}), 名称: ${business.businessName}`);
                    });
                    
                    // 更新商家数组中的数量
                    this.businessArray = this.businessArray.map(business => {
                        // 确保比较类型一致，JavaScript中对象的key始终是字符串
                        const businessIdStr = String(business.businessId);
                        let quantity = quantityMap[businessIdStr];
                        
                        if (quantity !== undefined && quantity > 0) {
                            // 确保转换为数字
                            business.quantity = parseInt(quantity);
                            console.log(`设置商家 ${business.businessId} (${business.businessName}) 的购物车数量为: ${business.quantity}`);
                        } else {
                            // 明确设置为0，避免undefined或null
                            business.quantity = 0;
                            console.log(`商家 ${business.businessId} (${business.businessName}) 在购物车映射中未找到匹配数量，设置为0`);
                        }
                        return business;
                    });
                    
                    // 再次验证quantity设置是否成功
                    this.businessArray.forEach(business => {
                        console.log(`最终商家 ${business.businessId} (${business.businessName}) 的购物车数量: ${business.quantity}`);
                    });
                }
            }).catch(error => {
                console.log("获取购物车数量失败:", error);
            });
        }
	},
    components:{
        Footer
    }
}
</script>

<style scoped>
    /****************** 总容器 ******************/
.wrapper{
	width: 100%;
	height: 100%;
}

/****************** header部分 ******************/
.wrapper header{
	width: 100%;
	height: 12vw;
	background-color: #0097FF;
	color: #fff;
	font-size: 4.8vw;
	
	position: fixed;
	left: 0;
	top: 0;
	z-index: 1000;
	
	display: flex;
	justify-content: center;
	align-items: center;
}

/****************** 商家列表部分 ******************/
.wrapper .business{
	width: 100%;
	margin-top: 12vw;
	margin-bottom: 14vw;
}
.wrapper .business li{
	width: 100%;
	box-sizing: border-box;
	padding: 2.5vw;
	border-bottom: solid 1px #DDD;
	user-select: none;
	cursor: pointer;
	
	display: flex;
	align-items: center;
}
.wrapper .business li .business-img{
	/*这里设置为相当定位，成为business-img-quantity元素的父元素*/
	position: relative;
}
.wrapper .business li .business-img img{
	width: 20vw;
	height: 20vw;
}
.wrapper .business li .business-img .business-img-quantity{
	width: 5vw;
	height: 5vw;
	background-color: red;
	color: #fff;
	font-size: 3.6vw;
	border-radius: 2.5vw;
	
	display: flex;
	justify-content: center;
	align-items: center;
	
	/*设置成绝对定位，不占文档流空间*/
	position: absolute;
	right: -1.5vw;
	top: -1.5vw;
	z-index: 10; /* 确保红点在最上层 */
}
.wrapper .business li .business-info{
	margin-left: 3vw;
}
.wrapper .business li .business-info h3{
	font-size: 3.8vw;
	color: #555;
}
.wrapper .business li .business-info p{
	font-size: 3vw;
	color: #888;
	margin-top: 2vw;
}
</style>