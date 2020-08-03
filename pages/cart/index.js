/*1 获取用户的收货地址
  1 绑定点击事件
  2 调用小程序内置 api 获取用户的收货地址 wx.chooseAddress
  3 获取用户对小程序所授予获取地址的权限状态scope
    1 假设  用户  点击获取收货地址的提示框  确定 authSetting scope.address: true
    scope 值  true
    2 假设  用户  点击获取收货地址的提示框  取消 authSetting scope.address: false
  4 把获取到的地址 存入到本地存储中

  2 页面加载完毕
    0 onShow  onLoad
    1 获取本地存储中的地址数据
    2 把数据  设置给data中的一个变量
  3 onshow
    1 获取缓存中的购物车数据
    2 把购物车数据 填充到data中
  4 全选的实现  数据的展示
    1 onShow获取缓存中的购物车数组
    2 根据购物车中的商品数据  所有的商品都被选中  checked=true  全选就被选中
  5 总价格和数量
    1 都需要商品被选中  我们才拿他来计算
    2 获取购物车数组
    3 遍历
    4 判断商品是否被选中
    5 总价格 += 商品的单价*商品的数量
    6 总数量 += 商品的数量
    7 把计算后的价格和数量  设置回data中即可
  6 商品的选中
    1 绑定change事件
    2 获取被修改的商品对象
    3 商品对象的选中状态 取反
    4 重新填充回data中和缓存中
    5 重新计算全选 总价格 总数量
  7 全选和反选
    1 全选复选框绑定事件  change
    2 获取data中的全选变量  allCkecked
    3 直接取反  allChecked=!allChecke
    4 遍历购物车数组  让里面  商品选中状态跟随  allChecked  改变而改变
    5 把购物车数组  和  allChecked  重新设置回data把购物车重新设置回缓存中
  8 商品数量的编辑
    1 "+""-"按钮  绑定同一个点击事件  区分的关键  自定义属性
      1 "+" "+1"
      2 "-" "-1"
    2 传递被点击的商品的goods_id
    3 获取data中的购物车数组  来获取需要被修改的商品对象
    4 当 购物车的数量 =1 同时 用户点击"-"
      弹窗提示(showModal)  询问用户  是否删除
      1 确定  直接执行删除
      2 取消  什么都不做 
    4 直接修改商品对象的数量 num
    5 把cart数组  重新设置回  缓存中  和data中  this.setCart
  9 点击结算
    1 判断有没有收货地址
    2 判断用户有没有选购商品
    3 经过以上验证  跳转到  支付页面
*/
import {getSetting,chooseAddress,openSetting,showModal,showToast} from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
  data:{
    address:{},
    cart:[],
    allChecked:false,
    totalPric:0,
    totalNum:0
  },
  onShow(){
    // 1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    // 1 获取缓存中的购物车数据
    const cart = wx.getStorageSync("cart")||{};
    // // 1 计算全选
    // // every 数组方法 会遍历 会接收一个回调函数 那么 每一个回调函数都返回true 那么 every的方法返回值为true
    // // 只要有一个回调函数返回了false 那么不再执行 直接返回false
    // // 空数组  调用every,返回值就是true
    // let allChecked = true;
    // // 1 总数量  总价格
    // let totalPric = 0;
    // let totalNum = 0;
    // cart.forEach(v=>{
    //   if(v.checked){
    //     totalPric += v.goods_price * v.num;
    //     totalNum += v.num;
    //   }
    //   else{
    //     allChecked = true
    //   }
    // })
    // // 判断数组是否为空
    // allChecked = cart.length!=0?allChecked:false;
    // // 2 给data数据赋值
    // this.setData({
    //   address,
    //   cart,
    //   allChecked,
    //   totalPric,
    //   totalNum
    // })
    this.setData({address});
    this.setCart(cart);
  },
  //  点击 收货地址
  async handleChooseAddress(){
    // // 1 获取权限状态
    // wx.getSetting({
    //   success: (result)=>{
    //     // console.log(result)
    //     // 2 获取权限状态 主要发现一些 属性名很怪异的时候 都要用[]
    //     const scopeAddress = result.authSetting["scope.address"];
    //     if(scopeAddress === true || scopeAddress === undefined){
    //       wx.chooseAddress({
    //         success: (result1)=>{
    //           console.log(result1);
    //         },
    //       });
    //     }
    //     else{
    //       // 3 用户  以前拒绝过授权限  先诱导用户打开授权页面
    //       wx.openSetting({
    //         success: (result2)=>{
    //           // 4 可以调用  收货地址代码
    //           wx.chooseAddress({
    //             success: (result3)=>{
    //               console.log(result3);
    //             },
    //           });
    //         },
    //       });
    //     }
    //   },
    //   fail: ()=>{},
    //   complete: ()=>{}
    // });
    // 1 获取  权限状态
    try {
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      // 2 判断  权限状态
      if(scopeAddress === false){
        //4 先诱导用户打开授权页面
        await openSetting();
      }
      // 3 调用获取收货地址的  api
      const address = await chooseAddress();
      address.all = address.provinceName+address.cityName+address.countyName+address.detailInfo;
      // 4 存入缓存中
      wx.setStorageSync("address", address);
    } catch (error) {
      console.log(error);
    }
  },
  // 商品的选中
  handleItemChang(e){
    // 1 获取被修改商品的id
    const goods_id = e.currentTarget.dataset.id;
    // console.log(goods_id);
    // 2 获取购物车数组
    let {cart} = this.data;
    // 3 找到被修改对象的商品对象
    let index = cart.findIndex(v=>v.goods_id === goods_id);
    // 4 选中取反
    cart[index].checked =! cart[index].checked;
    this.setCart(cart); 
  },
  // 设置购物车状态同时  重新计算  底部工具栏的数据  全选  总价格  购买数量
  setCart(cart){
    let allChecked = true;
    // 1 总数量  总价格
    let totalPric = 0;
    let totalNum = 0;
    cart.forEach(v=>{
      if(v.checked){
        totalPric += v.goods_price * v.num;
        totalNum += v.num;
      }
      else{
        allChecked = false;
      }
    })
    // 判断数组是否为空
    allChecked = cart.length!=0?allChecked:false;
    this.setData({
      cart,
      allChecked,
      totalPric,
      totalNum
    });
    wx.setStorageSync("cart", cart);
  },
  // 商品全选功能
  handleItemAllCheck(){
    // 1 获取data中的数据
    let {cart,allChecked} = this.data;
    // 2 修改值
    allChecked =! allChecked;
    // 3 循环修改cart数组  中的商品选中状态
    cart.forEach(v=>v.checked === allChecked);
    // 4 把修改后的值  填充回data中或缓存中
    this.setCart(cart);
  },
  // 商品数量的编辑功能
  async handleItemNumEdit(e){
    // 1 获取传递过来的参数
    const{operation,id} = e.currentTarget.dataset;
    // console.log(operation,id)
    // 2 获取购物车数组
    let{cart} = this.data;
    // 3 找到要修改的商品的索引
    const index = cart.findIndex(v=>v.goods_id===id);
    // 4 判断是否删除
    if(cart[index].num === 1 && operation === -1){
      // wx.showModal({
      //   title: '提示',
      //   content: '您是否要删除',
      //   success :(res)=> {
      //     if (res.confirm) {
      //       cart.splice(index,1);
      //       this.setCart(cart);
      //     } else if (res.cancel) {
      //       console.log('用户点击取消')
      //     }
      //   }
      // })
      const res = await showModal({content:"您是否要删除"});
      if (res.confirm) {
        cart.splice(index,1);
        this.setCart(cart);
      } 
    }
    else{
      // 4 进行修改数量
     cart[index].num+=operation;
     // 5 设置回缓存和data中
     this.setCart(cart);
    }
    
  },
  // 点击结算
  async handlePay(){
    // 1 判断收货地址
    const {address,totalNum} = this.data;
    if(!address.userName){
      await showToast({title:"您没有选择地址"});
      return;
    }
    // 2 判断用户有没有选购商品
    if(totalNum === 0){
      await showToast({title:'您没有选购商品'});
      return;
    }
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }
})