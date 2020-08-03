import{ request }from"../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
  data: {
    // 左侧的菜单数据
    leftMenuList:[],
    // 右侧的菜单数据
    rightContent:[],
    // 被点击左侧的菜单
    currentIndex:0,
    // 右侧内容条距离顶部的距离
    scrollTop:0
  },
// 接口返回数据
  Cates:[],

  onLoad: function (options) {
    // 1.先判断一下本地存储中有没有旧数据
    // {time:Data.now(),data:[...]}
    // 2.没有旧数据  直接发送新请求
    // 3.有旧的数据  同时  旧的数据也没有过期  就使用  本地存储的旧数据即可

    // 1.获取本地存储中的数据(小程序也是存在本地存储 技术)
    const Cates = wx.getStorageSync("cates");

    // 2.开始判断
    if(!Cates){
      // 不存在 发送请求获取数据
      this.getCates();
    }else{
      // 有旧的数据  定义过期时间  10s 改成  5分钟
      if(Date.now() - Cates.time > 1000 * 10){
        // 重新发送请求
        this.getCates();
      }else{
        // 可以使用旧的数据
        this.Cates = Cates.data;
        let leftMenuList = this.Cates.map(v => v.cat_name);
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },
  // 获取分类数据
   async getCates(){
    // request({
    //   url:"/categories"
    // })
    // .then(res=>{
    //   this.Cates = res.data.message;

    //   // 把接口的数据存入到本地存储中
    //   wx.setStorageSync("cates", {time:Date.now(),data:this.Cates});

    //   // 构造左侧的大菜单数据
    //   let leftMenuList = this.Cates.map(v => v.cat_name);
    //   // 构造右侧的大菜单数据
    //   let rightContent = this.Cates[0].children;
    //   this.setData({
    //     leftMenuList,
    //     rightContent
    //   })
    // })
    // 1.用es7的async await来发送请求
    const res = await request({url:"/categories"});
    this.Cates = res;
    // 把接口的数据存入到本地存储中
    wx.setStorageSync("cates", {time:Date.now(),data:this.Cates});
    // 构造左侧的大菜单数据
    let leftMenuList = this.Cates.map(v => v.cat_name);
    // 构造右侧的大菜单数据
    let rightContent = this.Cates[0].children;
    this.setData({
      leftMenuList,
      rightContent
    })
  },
  // 左侧菜单点击事件
  handleItemTap(e){
    // 获取被点击事件身上的索引
    const {index} = e.currentTarget.dataset;
    // 给data中的currentIndex赋值就可以了
    // 根据不同的索引来渲染右侧的商品内容
    let rightContent = this.Cates[index].children;
    this.setData({
      currentIndex:index,
      rightContent,
      // 重新设置 scroll_view标签距离顶部的位置
      scrollTop:0
    })
  }
})