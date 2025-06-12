<template>
    <div class="wrapper">
			
			<!-- header部分 -->
			<header>
				<p>确认订单</p>
			</header>
		
			<!-- 订单信息部分 -->
			<div class="order-info">

				<h5>订单配送至：</h5>
				<div class="order-info-address">
					<p @click="toUserAddress()">{{explain}}</p>
					<i class="fa fa-angle-right"></i>
				</div>
				<p>{{contactName}}{{contactSex}} {{contactTel}}</p>
			</div>


			<!-- {{item.business.businessName}} -->
			<h3>{{this.businessname}}</h3>
			<!-- 订单明细部分 -->
			<ul class="order-detailed">
				<li v-for="item in foodArray">
					<div class="order-detailed-left">
						<img :src="item.food.foodImg">
						<p>{{item.food.foodName}} x {{item.quantity}}</p>
					</div>
					<p>&#165;{{item.food.foodPrice}}</p>
				</li>
				
			</ul>
			
			<div class="order-deliveryfee">
				<p>配送费</p>
				<p>&#165;{{this.deliveryprice}}</p>
			</div>
			


			<!-- 合计部分 -->
			<div class="total">
				<div class="total-left">
					&#165;{{this.ordertotal+this.deliveryprice}}
				</div>
				<div class="total-right" @click="toOrder()">
					去支付
				</div>
			</div>
		</div>		
</template>
<script>
    export default {
        data() {
            return {
				explain:'请选择要配送的地址：',
                // 获取query参数
                businessId:this.$route.query.businessId,
				
                daId:this.$route.query.daId,
				contactSex:this.$route.query.contactSex,
				contactName:this.$route.query.contactName,
				contactTel:this.$route.query.contactTel,
				address:this.$route.query.address,
                user:{},
				foodArray:[],
				businessname:'',
				deliveryprice:'',
				ordertotal:0,
				orderId:0,

            }
        },
       
        created() {
			this.user = this.$getSessionStorage('user');
            if(this.address!=null){
				this.explain = this.address
			};
			console.log('商家ID:' + this.businessId);
            
            // 使用consumer服务获取购物车数据
            this.$axios.get('cart', {
                params: {
                    userId: this.user.userId,
                    businessId: this.businessId
                }
            }).then(response => {
                console.log("购物车响应:", response.data);
                if(response.data.code === 200) {
                    // 过滤掉数量为0的商品
                    const filteredCartItems = response.data.data.filter(item => item.quantity > 0);
                    this.foodArray = filteredCartItems;
                    console.log("过滤后的购物车数据:", this.foodArray);
                    
                    // 重置总金额
                    this.ordertotal = 0;
                    
                    // 只取第一个商品来获取商家信息
                    if(this.foodArray.length > 0) {
                        this.businessname = this.foodArray[0].business.businessName;
                        this.deliveryprice = this.foodArray[0].business.deliveryPrice;
                    }
                    
                    // 重新计算订单总价
                    for(let i = 0; i < this.foodArray.length; i++){
                        // 只对有效数量的商品计算价格
                        this.ordertotal += this.foodArray[i].food.foodPrice * this.foodArray[i].quantity;
                    }
                    
                    console.log("商品总价:", this.ordertotal);
                    console.log("配送费:", this.deliveryprice);
                }
            }).catch(error => {
                console.log(error);
            });
        },
		 methods: {
			toUserAddress() {
				console.log(this.businessId),
				this.$router.push({
					
					path:'/useraddress',
					query:{
						businessId:this.businessId
					}

				})
			},
            toOrder() {
				if(this.address==null){
					alert("请先选择收货地址！！")
					return;
				}
				
				// 确保配送费是数字
				const deliveryPrice = parseFloat(this.deliveryprice) || 0;
				// 计算总金额（商品总价+配送费）
				const totalAmount = this.ordertotal + deliveryPrice;
				
				// 确保businessId和daId是整数类型
				const businessId = parseInt(this.businessId);
				const daId = parseInt(this.daId);
				
				console.log("提交订单 - 商品总价:", this.ordertotal);
				console.log("提交订单 - 配送费:", deliveryPrice);
				console.log("提交订单 - 最终总价:", totalAmount);
				console.log("提交订单 - 商家ID:", businessId);
				console.log("提交订单 - 地址ID:", daId);
				
				// 获取购物车数据来创建订单
				this.$axios.get('cart', {
					params: {
						userId: this.user.userId,
						businessId: this.businessId
					}
				}).then(cartResponse => {
					// 过滤掉数量为0的商品
					const cartItems = cartResponse.data.data.filter(item => item.quantity > 0);
					
					// 创建订单明细列表
					const orderDetailList = cartItems.map(item => {
						return {
							foodId: item.foodId,
							quantity: item.quantity
						};
					});
					
					// 使用consumer服务创建订单
					this.$axios.post('order/create', {
						userId: this.user.userId,
						businessId: businessId,
						daId: daId,
						orderTotal: totalAmount,
						orderDetailList: orderDetailList
					}).then(response => {
					console.log("创建订单响应:", response.data);
					if(response.data.code === 200 && response.data.data != 0){
						this.orderId = response.data.data;
						console.log("创建的订单ID:", this.orderId);
						
						// 跳转到支付页面
						this.$router.push({
							path:'/payment',
							query:{
								orderId: this.orderId
							}
						});
					} else {
						console.log("创建订单失败");
					}
				}).catch(error => {
					console.error(error);
				});
				}).catch(error => {
					console.error("获取购物车数据失败", error);
				});
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

/****************** 订单信息部分 ******************/
.wrapper .order-info{
	/*注意这里，不设置高，靠内容撑开。因为地址有可能折行*/
	width: 100%;
	margin-top: 12vw;
	background-color: #0097EF;
	box-sizing: border-box;
	padding: 2vw;
	color: #fff;
}
.wrapper .order-info h5{
	font-size: 3vw;
	font-weight: 300;
}
.wrapper .order-info .order-info-address{
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	font-weight: 700;
	user-select: none;
	cursor: pointer;
	margin: 1vw 0;
}
.wrapper .order-info .order-info-address p{
	width: 90%;
	font-size: 5vw;
}
.wrapper .order-info .order-info-address i{
	font-size: 6vw;
}
.wrapper .order-info p{
	font-size: 3vw;
}

.wrapper h3{
	box-sizing: border-box;
	padding: 3vw;
	font-size: 4vw;
	color: #666;
	border-bottom: solid 1px #DDD;
}

/****************** 订单明细部分 ******************/
.wrapper .order-detailed{
	width: 100%;
}
.wrapper .order-detailed li{
	width: 100%;
	height: 16vw;
	box-sizing: border-box;
	padding: 3vw;
	color: #666;
	
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.wrapper .order-detailed li .order-detailed-left{
	display: flex;
	align-items: center;
}
.wrapper .order-detailed li .order-detailed-left img{
	width: 10vw;
	height: 10vw;
}
.wrapper .order-detailed li .order-detailed-left p{
	font-size: 3.5vw;
	margin-left: 3vw;
}
.wrapper .order-detailed li p{
	font-size: 3.5vw;
}
.wrapper .order-deliveryfee{
	width: 100%;
	height: 16vw;
	box-sizing: border-box;
	padding: 3vw;
	color: #666;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 3.5vw;
}

/****************** 订单合计部分 ******************/
.wrapper .total{
	width: 100%;
	height: 14vw;
	
	position: fixed;
	left: 0;
	bottom: 0;
	
	display: flex;
}
.wrapper .total .total-left{
	flex: 2;
	background-color: #505051;
	color: #fff;
	font-size: 4.5vw;
	font-weight: 700;
	user-select: none;
	
	display: flex;
	justify-content: center;
	align-items: center;
}
.wrapper .total .total-right{
	flex: 1;
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
</style>
