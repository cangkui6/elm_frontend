<<template>
 <div class="wrapper">
			
			<!-- header部分 -->
			<header>
				<p>用户注册</p>
			</header>
			
			<!-- 表单部分 -->
			<ul class="form-box">
				<li>
					<div class="title">
						手机号码：
					</div>
					<div class="content">
						<input type="text" placeholder="手机号码" v-model="user.userId" @blur="blur">
					</div>
				</li>
				<li>
					<div class="title">
						密码：
					</div>
					<div class="content">
						<input type="password" placeholder="密码" v-model="user.password">
					</div>
				</li>
				<li>
					<div class="title">
						确认密码：
					</div>
					<div class="content">
						<input type="password" placeholder="确认密码" v-model="repassword">
					</div>
				</li>
				<li>
					<div class="title">
						用户姓名：
					</div>
					<div class="content">
						<input type="text" placeholder="用户姓名" v-model="user.userName">
					</div>
				</li>
				<li>
					<div class="title">
						性别：
					</div>
					<div class="content" style="font-size: 3vw;">
						<input type="radio" name="userSex" style="width:6vw;height: 3.2vw;" value="0" v-model="user.userSex">女
						<input type="radio" name="userSex" checked style="width:6vw;height: 3.2vw;" value="1" v-model="user.userSex">男
						
					</div>
				</li>
			</ul>
			
			<div class="button-login">
				<button @click="toIndex()" :disabled="disabled">注册</button>
			</div>
            <!-- 底部菜单部分 -->
			<ul class="footer">
				<li onclick="location.href='index.html'">
					<i class="fa fa-home"></i>
					<p>首页</p>
				</li>
				<li>
					<i class="fa fa-compass"></i>
					<p>发现</p>
				</li>
				<li onclick="location.href='orderList.html'">
					<i class="fa fa-file-text-o"></i>
					<p>订单</p>
				</li>
				<li>
					<i class="fa fa-user-o"></i>
					<p>我的</p>
				</li>
			</ul>
		</div>	
</template>

<script>
import Footer from '../components/Footer.vue'

export default {
    data() {
		return {
			user:{
				userId:'',
				password:'',
				userName:'',
				userSex:'1'

			},
			repassword:'',
			disabled:false
			
		}
	},
	methods: {
		
		 blur(){
			if(this.user.userId.length==11){
				this.$axios.post('/user/getUserById',this.$qs.stringify({
				userId : this.user.userId
				})).then(response=>{
					console.log("检查用户存在响应:", response.data);
					if(response.data.code === 200 && response.data.data === 1){
						alert("该用户已存在，请前往登录")
						this.$router.push({
							path:'/login'
						})
					}
				}).catch(error=>{
					console.log("error", error)
				})
			}else{
				alert("用户名格式输入不正确")
			}
			
        },
		
		toIndex(){
			if(this.user.password.length<8){
				alert("用户密码简单");
				return;
			}else if(this.user.password.length>20){
				alert("用户密码过长")
				return;
			};
			if(this.user.password!=this.repassword){
				alert("两次输入密码不一致")
				return;
			}


			if(this.user.userId!=null&&this.user.password!=null&&this.repassword!=null&&this.user.userSex!=null){
			this.disabled=true

			this.$axios.post('/user/saveUser',this.$qs.stringify({
				userId:this.user.userId,password:this.user.password,userName:this.user.userName,userSex:this.user.userSex
			})).then(response=>{
				console.log(response.data)
				if(response.data.code === 200){
					alert("注册成功")
					this.$router.push({
						path:'/login',
						query: {
							from: 'register',
							userId: this.user.userId // 顺便传递用户ID，方便登录
						}
					})
				} else {
					alert("注册失败：" + (response.data.message || "未知错误"))
					this.disabled = false
				}
			}).catch(error=>{
				console.log(error)
				alert("注册请求失败，请重试")
				this.disabled = false
			})
			
			}else{
				alert("请输入注册信息！！！")
			}
			
		}

	},
	created() {

	},
	components: {
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

/****************** 表单部分 ******************/
.wrapper .form-box{
	width: 100%;
	margin-top: 12vw;
}
.wrapper .form-box li{
	box-sizing: border-box;
	padding: 4vw 3vw 0 3vw;
	display: flex;
	align-items: center;
}
.wrapper .form-box li .title{
	flex: 0 0 18vw;
	font-size: 3vw;
	font-weight: 700;
	color: #666;
}
.wrapper .form-box li .content{
	flex: 1;
}
.wrapper .form-box li .content input{
	border: none;
	outline: none;
	width: 100%;
	height: 4vw;
	font-size: 3vw;
}
.wrapper .button-login{
	width: 100%;
	box-sizing: border-box;
	padding: 4vw 3vw 0 3vw;
}
.wrapper .button-login button{
	width: 100%;
	height: 10vw;
	font-size: 3.8vw;
	font-weight: 700;
	color: #fff;
	background-color: #38CA73;
	border-radius: 4px;
	
	border: none;
	outline: none;
}
.wrapper .button-register{
	width: 100%;
	box-sizing: border-box;
	padding: 4vw 3vw 0 3vw;
}
.wrapper .button-register button{
	width: 100%;
	height: 10vw;
	font-size: 3.8vw;
	font-weight: 700;
	color: #666;
	background-color: #EEE;
	border-radius: 4px;
	
	border: none;
	outline: none;
	border: solid 1px #DDD;
}
/****************** 底部菜单部分 ******************/
.wrapper .footer{
	width: 100%;
	height: 14vw;
	border-top: solid 1px #DDD;
	background-color: #fff;
	
	position: fixed;
	left: 0;
	bottom: 0;
	
	display: flex;
	justify-content: space-around;
	align-items: center;
}
.wrapper .footer li{
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	
	color: #999;
	user-select: none;
	cursor: pointer;
}
.wrapper .footer li p{
	font-size: 2.8vw;
}
.wrapper .footer li i{
	font-size: 5vw;
}
</style>