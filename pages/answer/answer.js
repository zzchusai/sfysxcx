const app = getApp();
const net = require("../../utils/http.js");
const account = require("../../utils/account.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerData: [], //banner数据
    page: 1,
    allowLoadMore: true, //是否允许加载更多
    selectCategory: 0, //当前选中的banner id
    mutableData: [],
    scrollHeight: 0,
    scrollWidth: 0,
    isData: false, //数据是否为空
    netWork: true, //网络是否正常
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let dpr = app.globalData.DPR;
    let scrollHeight = app.globalData.DHeight - dpr * (88 + 49 + 64);
    this.setData({
      scrollHeight: scrollHeight,
      scrollWidth: app.globalData.DWidth
    });
    this.getNetStatus();
    this.getBannerData();
  },
  /**
   * 获取网络状态
   * */
  getNetStatus() {
    let self = this;
    net.netStatus(function(res) {
      self.setData({
        netWork: res
      });
    });
  },
  /**
   * 刷新网络错误
   * */
  reloadNet() {
    this.getNetStatus();
    if (this.data.bannerData.length<=0){
      this.getBannerData();
    }else{
      this.getListData();
    }
    
  },
  /**
   * 获取banner数据
   * */
  getBannerData() {
    let self = this;
    net.http({
      url: "indexGroup",
      fuSuccess(res) {
        self.setData({
          bannerData: res.data.data,
          page: 1,
          mutableData: [],
          selectCategory: res.data.data[0].id,
          allowLoadMore: true
        });
        self.getListData();
      },
      complete() {}
    })
  },

  /**
   * 获取列表数据
   * */
  getListData() {
    this.getNetStatus();
    if (!this.data.allowLoadMore) {
      return
    };
    let self = this;
    net.http({
      parameter: {
        page: this.data.page,
        group_id: this.data.selectCategory
      },
      url: "interIndex",
      fuSuccess(res) {
        let mutableData = self.data.mutableData;
        if (res.data.data && res.data.data.constructor == Array){
          res.data.data.map(function(item) {
            if (item.nickname == null || item.nickname.length <= 0) {
              item.nickname = "匿名用户";
            }
            mutableData.push(item);
          })
        }else{
          if(res.data.msg){
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }
        if (mutableData.length > 0) {
          self.setData({
            isData: false
          })
        } else {
          self.setData({
            isData: true
          })
        }
        let allowLoadMore = res.data.data?res.data.data.length > 9:false;
        self.setData({
          mutableData: mutableData,
          page: (self.data.page + 1),
          allowLoadMore: allowLoadMore,
        });
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      },
      complete() {}
    })



  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  //选取的banner
  _selectbanner(res) {
    this.setData({
      selectCategory: res.detail,
      page: 1,
      mutableData: [],
      allowLoadMore: true
    });
    this.getListData();
  },

  /**
   * 编辑问答
   * */
  toEdit() {

    if (!account.isLogin(false, true, "../profile/profile")) {
      return
    };

    wx.navigateTo({
      url: '../writeAnswer/writeAnswer?selectId=' + this.data.selectCategory,
    })

  },

  /**
   * 加载更多
   * */
  onReachBottom() {
    this.getListData();
  },
  toAnswerDetail(events) {
    let id = events.currentTarget.dataset.index;
    let url = '../answerDetail/answerDetail?id=' + id
    wx.navigateTo({
      url: url,
    })
  },
  /**
   * 登录
   * */
  toLogin() {
    let user = wx.getStorageSync("userInfo");
    if (user && user.length > 1) {
      return;
    }
    account.getUser();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})