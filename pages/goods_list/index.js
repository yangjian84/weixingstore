// 1 用户上划页面 滚动条触底 开始加载下一页数据
      // a 找到滚动条触底事件 微信小程序官方开发文档中寻找
        // 1 获取到总页数   只有总条数
            // 总页数 = Math.ceil(总条数/页容量 pagesize)
        // 2 获取到当前的页码
        // 3 判断一下 当前的页码是否大于等于 总页数
      // b 判断还有没有下一页数据
      // c 假如没有下一页数据 弹出一个提示
      // d 假如还有下一页数据 来加载下一页数据
        // 1 当前的页码++
        // 2 重新发送请求
        // 3 数据请求回来
  //2 下拉刷新页面
    //  1 触发下拉刷新页面  需要在json文件中开启一个配置项
    //  2 重置 数据 数组
      //3 重置页码 设置为1
import{ request }from"../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs:[
      {
        id:0,
        value:"综合",
        isActive:true
      },
      {
        id:1,
        value:"销量",
        isActive:false
      },
      {
        id:2,
        value:"价格",
        isActive:false
      }
    ],
    goodsList:[],
    
  },
  QueryParams:{
    query:"",
    cid:"",
    pagenum:1,
    pagesize:10
  },
  totalPages:1,
//  生命周期函数--监听页面加载
  onLoad: function (options) {
    this.QueryParams.cid = options.cid||"";
    this.QueryParams.query = options.query||"";
    this.getGoodList();
  },

// 获取商品列表数据
  async getGoodList(){
    const res = await request({url:"/goods/search",data:this.QueryParams});
    // 获取  总条数
    const total = res.total;
    // 计算  总页数
    this.totalPages = Math.ceil(total / this.QueryParams.pagesize);
    // console.log(this.totalPages)
    this.setData({
      // 拼接数组
      goodsList:[...this.data.goodsList,...res.goods]
    })
    // 关闭下拉刷新的窗口
    wx.stopPullDownRefresh();
  },

  // 标题点击事件  从子组件传递过来
  handleTabsItemChange(e){
    // 1 获取被点击的标题索引
    const {index} = e.detail;
    // 2 修改源数组
    let {tabs} = this.data;
    tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
    // 3 赋值到data中
    this.setData({
      tabs
    })
  },

  // 页面下拉刷新
  onReachBottom(){
    // 1 判断还有没有下一页数据
    if(this.QueryParams.pagenum>=this.totalPages){
      // 没有下一页数据
      wx.showToast({title: '没有下一页数据'});
    }
    else{
      // 有下一页数据
      // console.log("有下一页数据");
      this.QueryParams.pagenum++;
      this.getGoodList();
    }
  },

  // 下拉刷新事件
  onPullDownRefresh(){
    //1 重置数组
    this.setData({
      goodsList:[]
    })
    // 2 重置页码
    this.QueryParams.pagenum=1;
    // 3 发送请求
    this.getGoodList();
  }
})