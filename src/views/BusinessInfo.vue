<template>
<!-- 每个vue中有三个部分template，script，style -->
    		<div class="wrapper">
			
			<!-- header部分 -->
			<header>
				<p>商家信息</p>
			</header>
			
			<!-- 商家logo部分 -->
			<div class="business-logo">
                <!-- 属性绑定:src不需要加大括号"business.businessImg" -->
				<img :src="business.businessImg">
			</div>
			
			<!-- 商家信息部分 -->
			<div class="business-info">
				<h1>{{business.businessName}}</h1>
				<p>&#165;{{business.starPrice}}起送 &#165;{{business.deliveryPrice}}配送</p>
				<p>{{business.businessExplain}}</p>
			</div>
			
			<!-- 食品列表部分 -->
			<ul class="food">
				<li v-for="(item,index) in foodArray">
					<div class="food-left">
						<img :src="item.foodImg">
						<div class="food-left-info">
							<h3>{{item.foodName}}</h3>
							<p>{{item.foodExplain}}</p>
							<p>&#165;{{item.foodPrice}}</p>
						</div>
					</div>
					<div class="food-right">
						<div>
							<!-- 减号按钮 -->
							<i class="fa fa-minus-circle" @click="minus(index)" v-show="item.quantity>0"></i>
							<!-- 添加一个额外的减号按钮，当数量为0时也显示但是颜色变淡且禁用点击 -->
							<button class="minus-btn disabled" v-show="item.quantity==0">-</button>
						</div>
						<p><span v-if="item.quantity>0">{{item.quantity}}</span></p>
						<div>
							<!-- 加号按钮 -->
							<i class="fa fa-plus-circle" @click="plus(index)"></i>
						</div>
					</div>
				</li>
				
			</ul>
			
			<!-- 购物车部分 -->
			<div class="cart">
				<div class="cart-left">
					<div class="cart-left-icon">
						<i class="fa fa-shopping-cart"></i>
						<div class="cart-left-icon-quantity" v-show="totalCount>0">{{totalCount}}</div>
					</div>
					<div class="cart-left-info">
						<p>&#165;{{totalPrice}}</p>
						<p>另需配送费{{business.deliveryPrice}}元</p>
					</div>
				</div>
				<div class="cart-right">
					<!-- 不够起送费 -->
					<!--
					<div class="cart-right-item">
						&#165;15起送
					</div>
					-->
					<!-- 达到起送费 -->
					<div class="cart-right-item" @click="toOrder()">
					    去结算
					</div>
				</div>
			</div>
			
		</div>	
</template>


<script>
    export default{
        data() {
            return {
                // 获取query参数
                businessId:this.$route.query.businessId,
                business:{},
                foodArray:[],
                user:{},
				// cartArray:[],
				countPrice:{
					count: 0,
					price: 0
				},
				
				
            }
        },
        created() {
             // 从setSessionStorage中获取到用户的信息，如果没有用户信息，返回null
            this.user = this.$getSessionStorage('user');
			console.log(this.user);

            // 使用consumer服务获取商家和食品信息
            this.$axios.get(`business/${this.businessId}`, {
                params: {
                    userId: this.user ? this.user.userId : null
                }
            }).then(response => {
                console.log("商家和食品信息响应:", response.data);
                if(response.data.code === 200) {
                    this.business = response.data.data.business;
                    this.foodArray = response.data.data.foodList;
                    
                    console.log("商家数据:", this.business);
                console.log("食品数据:", this.foodArray);
                    
                    // 初始化食品数量
                    for(let i = 0; i < this.foodArray.length; i++){
					this.foodArray[i].quantity = 0;
				}
                    
                    // 如果用户已登录，获取购物车信息
                    if(this.user != null){
					this.listCart();
				}
                } else {
                    console.log("获取商家和食品信息失败");
				}
            }).catch(error => {
                console.error(error);
            });

        },
        // 鼠标操作产生的方法
        methods: {
			toOrder() {
				if(this.user==null){
                    this.$router.push({
                        path:'/login',
                        query: {
                            redirect: this.$route.fullPath
                        }
                    });
                }else{
					this.$router.push({
                    	path:'/order',
					query:{
						businessId:this.businessId
                	}
               		})
				}
			},
			listCart(){
				// 使用consumer服务获取购物车数据
				this.$axios.get('cart', {
					params: {
						userId: this.user.userId,
						businessId: this.businessId
					}
				}).then(response => {
					console.log("购物车响应:", response.data);
					if(response.data.code === 200) {
						let cartArray = response.data.data;
						console.log("购物车数据:", cartArray);
						
						// 先重置所有食品数量为0
						for(let foodItem of this.foodArray) {
							foodItem.quantity = 0;
						}
						
						// 遍历购物车数据，设置对应食品的数量
						for(let cartItem of cartArray) {
							for(let foodItem of this.foodArray) {
								// 找到前台后台对应的foodId
								if(foodItem.foodId === cartItem.foodId) {
									// 设置食品数量为购物车中的数量
									foodItem.quantity = cartItem.quantity;
									break;
								}
							}
						}
					
						// 刷新列表
						this.foodArray.sort();
					}
				}).catch(error => {
					console.log(error);
				});
			},
           
            minus(index){
				// 减号按钮
                // 首先验证用户是否登录，判断用户是否存在，如果不存在，跳转到用户登录界面
                if(this.user==null){
                    this.$router.push({
                        path:'/login',
                        query: {
                            redirect: this.$route.fullPath
                        }
                    });
                }else{
					// 防止数量为0时点击减号
					if(this.foodArray[index].quantity <= 0) {
						return;
					}
					
					// 登录的话，就留在该页面，判断一下前台的数量是否为1
					// 如果是1的话，再点击减号按钮，购物车就需要删除该条记录
					if(this.foodArray[index].quantity==1){
						this.removeCart(index);
					}else{
						// 暂时更新前端显示
						this.foodArray[index].quantity--;
						// 使用减少数量的逻辑
						this.decreaseCart(index);
					}
				}
                
            },
            plus(index){
				// 加号按钮
                // 首先验证用户是否登录，如果没登陆，就跳转到用户登录界面
                if(this.user==null){
                    // 跳转到登录页面，但保存当前页面作为重定向目标
                    this.$router.push({
                        path:'/login',
                        query: {
                            redirect: this.$route.fullPath
                        }
                    });
                }else{
					// 登录了就留在该页面
					// 判断foodArray数组中food对象的quantity是否为0，(因为在刚显示该页面的时候，将前台的数量设置为0)
					// 如果是的话就向购物车表中添加一条记录
					// 不是的话就调用更新的方法，更新数据库购物车中的数量
					if(this.foodArray[index].quantity==0){
						this.saveCart(index);
					}else{
						// 暂时更新前端显示
						this.foodArray[index].quantity++;
						// 调用后端更新
						this.updateCart(index);
					}
				}
			},
            
			// 向购物车表中添加一条记录
			saveCart(index) {
				this.$axios.post('cart/add', this.$qs.stringify({
					userId: this.user.userId,
					businessId: this.businessId,
					foodId: this.foodArray[index].foodId
				})).then(response => {
					console.log("添加购物车响应:", response.data);
					if(response.data.code === 200) {
						// 更新购物车数据
						this.listCart();
					} else {
						console.log("添加记录失败");
					}
				}).catch(error => {
					console.log(error);
				});
			},

			// 根据用户编号、商家编号、食品编号更新数量
			updateCart(index) {
				// 使用update端点更新商品数量
				this.$axios.post('cart/update', this.$qs.stringify({
					userId: this.user.userId,
					businessId: this.businessId,
					foodId: this.foodArray[index].foodId,
					quantity: this.foodArray[index].quantity
				})).then(response => {
					console.log("更新购物车响应:", response.data);
					if(response.data.code === 200) {
						// 刷新购物车数据以保持前后端一致
						this.listCart();
					} else {
						console.log("更新记录失败");
					}
				}).catch(error => {
					console.log(error);
				});
			},
			
			// 根据用户编号、商家编号、食品编号删除购物车表中的一条食品记录
			removeCart(index) {
				// 直接调用专门的update接口，传入数量0
				this.$axios.post('cart/update', this.$qs.stringify({
					userId: this.user.userId,
					businessId: this.businessId,
					foodId: this.foodArray[index].foodId,
					quantity: 0
				})).then(response => {
					console.log("删除购物车响应:", response.data);
					if(response.data.code === 200) {
						// 刷新购物车数据以保持前后端一致
						this.listCart();
					}
				}).catch(error => {
					console.log(error);
				});
			},
			
			// 减少购物车中的数量
			decreaseCart(index) {
				// 直接调用专门的update接口，传入当前数量
				this.$axios.post('cart/update', this.$qs.stringify({
					userId: this.user.userId,
					businessId: this.businessId,
					foodId: this.foodArray[index].foodId,
					quantity: this.foodArray[index].quantity // 发送减少后的数量
				})).then(response => {
					console.log("减少购物车响应:", response.data);
					if(response.data.code === 200) {
						// 刷新购物车数据以保持前后端一致
						this.listCart();
					} else {
						console.log("减少数量失败");
					}
				}).catch(error => {
					console.log(error);
				});
			}
			
        },
		computed: {
			totalPrice() {
				// 计算总价格
				let price = 0;
				for(let i = 0; i < this.foodArray.length; i++){
					if(this.foodArray[i].quantity > 0) {
						price += this.foodArray[i].quantity * this.foodArray[i].foodPrice;
					}
				}
				
				console.log("总价格:", price);
				return price;
			},
			totalCount() {
				// 计算总数量
				let count = 0;
				for(let i = 0; i < this.foodArray.length; i++){
					if(this.foodArray[i].quantity > 0) {
						count += this.foodArray[i].quantity;
					}
				}
				
				console.log("总数量:", count);
				return count;
			}
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

/****************** 商家logo部分 ******************/
.wrapper .business-logo{
	width: 100%;
	height: 35vw;
	/*使用上外边距避开header部分*/
	margin-top: 12vw;
	
	display: flex;
	justify-content: center;
	align-items: center;
}
.wrapper .business-logo img{
	width: 40vw;
	height: 30vw;
	border-radius: 5px;
}

/****************** 商家信息部分 ******************/
.wrapper .business-info{
	width: 100%;
	height: 20vw;
	
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.wrapper .business-info h1{
	font-size: 5vw;
}
.wrapper .business-info p{
	font-size: 3vw;
	color: #666;
	margin-top: 1vw;
}

/****************** 食品列表部分 ******************/
.wrapper .food{
	width: 100%;
	/*使用下外边距避开footer部分*/
	margin-bottom: 14vw;
}
.wrapper .food li{
	width: 100%;
	box-sizing: border-box;
	padding: 2.5vw;
	user-select: none;
	
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.wrapper .food li .food-left{
	display: flex;
	align-items: center;
}
.wrapper .food li .food-left img{
	width: 20vw;
	height: 20vw;
}
.wrapper .food li .food-left .food-left-info{
	margin-left: 3vw;
}
.wrapper .food li .food-left .food-left-info h3{
	font-size: 3.8vw;
	color: #555;
}
.wrapper .food li .food-left .food-left-info p{
	font-size: 3vw;
	color: #888;
	margin-top: 2vw;
}
.wrapper .food li .food-right{
	width: 16vw;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.wrapper .food li .food-right .fa-minus-circle{
	font-size: 5.5vw;
	color: #999;
	cursor: pointer;
}
.wrapper .food li .food-right .minus-btn{
	width: 5.5vw;
	height: 5.5vw;
	border-radius: 50%;
	background-color: #eee;
	color: #999;
	font-size: 4vw;
	font-weight: bold;
	border: none;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
}
.wrapper .food li .food-right .minus-btn.disabled {
	background-color: #f8f8f8;
	color: #ddd;
	cursor: default;
}
.wrapper .food li .food-right p{
	font-size: 3.6vw;
	color: #333;
}
.wrapper .food li .food-right .fa-plus-circle{
	font-size: 5.5vw;
	color: #0097EF;
	cursor: pointer;
}

/****************** 购物车部分 ******************/
.wrapper .cart{
	width: 100%;
	height: 14vw;
	
	position: fixed;
	left: 0;
	bottom: 0;
	
	display: flex;
}
.wrapper .cart .cart-left{
	flex: 2;
	background-color: #505051;
	display: flex;
}
.wrapper .cart .cart-left .cart-left-icon{
	width: 16vw;
	height: 16vw;
	box-sizing: border-box;
	border: solid 1.6vw #444;
	border-radius: 8vw;
	background-color: #3190E8;
	font-size: 7vw;
	color: #fff;
	
	display: flex;
	justify-content: center;
	align-items: center;
	
	margin-top: -4vw;
	margin-left: 3vw;
	
	position: relative;
}
.wrapper .cart .cart-left .cart-left-icon-quantity{
	width: 5vw;
	height: 5vw;
	border-radius: 2.5vw;
	background-color: red;
	color: #fff;
	font-size: 3.6vw;
	
	display: flex;
	justify-content: center;
	align-items: center;
	
	position: absolute;
	right: -1.5vw;
	top: -1.5vw;
}
.wrapper .cart .cart-left .cart-left-info p:first-child{
	font-size: 4.5vw;
	color: #fff;
	margin-top: 1vw;
}
.wrapper .cart .cart-left .cart-left-info p:last-child{
	font-size: 2.8vw;
	color: #AAA;
}

.wrapper .cart .cart-right{
	flex: 1;
}
/*达到起送费时的样式*/
.wrapper .cart .cart-right .cart-right-item{
	width: 100%;
	height: 100%;
	background-color: #38CA73;
	color: #fff;
	font-size: 4.5vw;
	font-weight: 700;
	user-select: none;
	cursor: pointer;
	
	display: flex;
	justify-content: center;
	align-items: center;
}

/*不够起送费时的样式（只有背景色和鼠标样式的区别）*/
/*
.wrapper .cart .cart-right .cart-right-item{
	width: 100%;
	height: 100%;
	background-color: #535356;
	color: #fff;
	font-size: 4.5vw;
	font-weight: 700;
	user-select: none;
	
	display: flex;
	justify-content: center;
	align-items: center;
}
*/
</style>