  const app = getApp();
const net = require("../../utils/http.js");
const readRecords = require("../../utils/readRecords.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerData: [],
    DHeight: 0,
    page: 1,
    allowLoadMore: true, //是否允许加载更多
    mutableData: [],
    netWork: true, //网络是否正常
    index:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    this.getBannerData();
    self.setData({
      page: 1,
      mutableData: [],
      allowLoadMore: true
    });
    self.getListData();
    self.getNetStatus();
  },
  getNetStatus() {
    let self = this;
    net.netStatus(function (res) {
      self.setData({netWork:res})
    });
  },
  /**
   * 获取banner数据
   * */

  getBannerData() {
    let self = this;
    net.http({
      url: "bannerList",
      fuSuccess(res) {
        self.setData({
          bannerData: res.data.data
        });
      },
      complete() {
      }
    })
  },

  /**
   * 加载更多
   * */
  loadMore() {
    if (this.data.allowLoadMore) {
      this.getListData();
    }
  },


  /**
   * 获取列表数据
   */
  getListData() {
    let self = this;
    net.http({
      url: "siftArticle",
      parameter: {
        page: self.data.page
      },
      fuSuccess(res) {
        if (res.data.data) {
          self.synchData(res.data.data);
        }
      }
    })
  },


  /**
   * 同步数据 是否阅读过
   * */
  synchData(list) {
    let mutableData = this.data.mutableData;
    if (list.constructor == Array) {
      list.map(function(item) {
        item.isRead = readRecords.queryRecords(item.id);
        mutableData.push(item);
      })
      this.setData({
        mutableData: mutableData,
        allowLoadMore: list.length > 9,
        page: (this.data.page + 1)
      });
    }
  },


  /**
   * 点击cell
   */
  selectCell(res) {
    let index = res.target.dataset.index;
    let mutableData = this.data.mutableData;
    let item = mutableData[index];
    readRecords.addRecords(item.id);
    item.isRead = true;
    this.setData({
      mutableData: mutableData,
    });
    let url = "../articleDetail/articleDetail?id=" + item.id;
    wx.navigateTo({
      url: url,
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let info = wx.getSystemInfoSync();
    app.globalData.DWidth = info.screenWidth;
    app.globalData.DHeight = info.screenHeight;
    app.globalData.DPR = app.globalData.DWidth / 350.0;
    let DHeight = info.screenHeight - app.globalData.DPR * (58 + 64);
    app.globalData.isIos = info.system.indexOf("iOS") != -1 ;
    this.setData({
      DHeight: DHeight
    });
  },
  //点击搜索
  goSearch() {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  /**
   * 点击网络出错图案
   * */
  reloadNet() {
    let self = this;
    net.netStatus(function(res) {
      self.setData({
        netWork: res
      });
    });
    this.getBannerData();
    this.getListData();
  },
  submit(){
    wx.showLoading({
      title: '1233',
    })
  },
  /**
   * 加载更多，上拉刷新
   * */
  onReachBottom() {
    this.loadMore();
  }
})