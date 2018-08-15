const app = getApp();
const net = require("../../utils/http.js");
const readRecords = require("../../utils/readRecords.js");
// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotartData: [],
    keywords: '',
    netWork: '', //网络是否正常
    page: 1,
    ishotArt: true, //是否是热门文章
    isData: true, //数据是否为空
    ishotart: true,
    showart:false,
    netWorks:true,
    allowLoadMore:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getNetStatus();
    this.getHotArticle();
  },
  /**
   * 获取网络状态
   * */
  getNetStatus() {
    let self = this;
    net.netStatus(function(res) {
      self.setData({
        netWork: res,
      });
    });
  },

  /**
   * 获取热门文章
   * */
  getHotArticle() {
    let self = this;
    net.http({
      url: 'hotArticle',
      fuSuccess(res) {
        self.setData({
          hotartData: res.data.data,
          showart:false
        })
      },
    })
  },
  selectCell(event) {
    let self = this;
    let index = event.currentTarget.dataset.index;
    let id = self.data.hotartData[index].id;
    let url = '../articleDetail/articleDetail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  //删除搜索框内容
  delSearch() {
    this.setData({
      keywords: '',
    });
  },
  inputWords(event) {
    this.setData({
      keywords: event.detail.value,
    });
  },
  searchArt() {
    let self = this;
    net.http({
      url: 'articleSearch',
      parameter: {
        key_word: self.data.keywords,
        page: self.data.page
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          self.synchData(res.data.data);
        }
      }
    })
    self.getNetStatus();
  },


  //点击搜索
  toSearch(events) {
    let self = this;
    var reg = /^\s+$/g ;
    if (events.detail.value==''||reg.test(events.detail.value)) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return;
    }
    wx.onNetworkStatusChange(function(res){
      self.setData({
        netWorks: res.isConnected,
        allowLoadMore:false
      })
    })
   if(!self.data.netWorks){
     wx.showToast({
       title: '网络链接出错',
       icon: 'loading'
     })
     return;
   }
    self.setData({
      ishotart: false,
      hotartData: [],
      page: 1,
      keywords: events.detail.value,
      showart:true
    })
    self.searchArt();
  },
  synchData(list) {
    let self = this;
    let hotartData = self.data.hotartData;
    if (list.constructor == Array) {
      list.map(function(item) {
        hotartData.push(item);
      });
      self.setData({
        hotartData: hotartData,
        allowLoadMore: hotartData.length > 9,
        page: self.data.page + 1
      })
    };
    if (hotartData.length > 0) {
      self.setData({
        isData: true
      })
    } else {
      self.setData({
        isData: false
      })
    }
  },
  onReachBottom() {
   if(this.data.allowLoadMore){
     this.searchArt();
   }else{
    if(!this.data.netWorks){
      wx.showToast({
        title:'网络链接错误',
        icon:'loading'
      })
    }else{
        this.searchArt();
    }
   }
  },
  /**
   * 刷新网络错误
   * */
  reloadNet() {
    this.getNetStatus();
    if(this.data.showart){
     this.searchArt()
    }else{
      this.setData({
        ishotart: true
      })
      this.getHotArticle()
    }
  },
})