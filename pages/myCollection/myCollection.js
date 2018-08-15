// pages/profile/profile.js
const app = getApp();
const net = require("../../utils/http.js");
const readRecords = require("../../utils/readRecords.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    netWork: true, //网络是否正常
    currentTabsIndex: 0, //当前点击的tab菜单
    artData: [], //文章
    answerData: [], //问答
    page: 1, //文章翻页
    pages: 1, //回答翻页
    allowLoadMore: true, //文章允许加载更多
    allowLoadMores: false, //问答允许加载更多
    user_id: 0,
    noArtCollect:'',
    noAnswerCollect:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userInfo = JSON.parse(wx.getStorageSync("userInfo"));
    if (userInfo) {
      this.setData({
        page: 1,
        artData: [],
        allowLoadMore: true,
        user_id: userInfo.id,
        // allowLoadMores: true
      });
    } else {
      this.setData({
        page: 1,
        artData: [],
        allowLoadMore: true,
        // allowLoadMores: true
      });
    }
    this.getNetStatus();
    this.getArtData();
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
    this.getArtData();
  },
  //tab切换
  onTabsItemTap(events) {
    let self = this;
    let index = events.target.dataset.index;
    self.setData({
      currentTabsIndex: index,
    })
    if (self.data.currentTabsIndex == 0) {
      self.setData({
        page:1,
        artData: [],
        allowLoadMore: true,
      })
      self.getArtData()
    } else {
      self.setData({
        pages: 1,
        answerData: [],
        allowLoadMores: true,
      })
      self.getAnswerData();
    }
  },
  //获取文章数据列表
  getArtData() {
    let self = this;
    net.http({
      url: 'myCollect',
      parameter: {
        page: self.data.page,
        type: 2
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          self.synchData(res.data.data)
        }
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },
  //获取问答列表
  getAnswerData() {
    let self = this;
    net.http({
      url: "myCollect",
      parameter: {
        page: self.data.pages,
        type: 5
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          self.synchData(res.data.data)
        }
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
  //前往文章详情页
  toMyArticleDetail(event) {
    let url = '../articleDetail/articleDetail?id=' + event.currentTarget.dataset.index;
    wx.navigateTo({
      url: url
    })
  },
  //前往问答详情页
  toMyAnswerDetail(event) {
    let url = '../answerDetail/answerDetail?id=' + event.currentTarget.dataset.index;
    wx.navigateTo({
      url: url
    })
  },
  synchData(list) {
    let self = this;
    if (self.data.currentTabsIndex == 0) {
      let artData = self.data.artData;
      if (list.constructor == Array) {
        list.map(function(item) {
          // 过滤头像，昵称
          let obj = item;
          if (item.anonymous == 2) {
            obj.avatar = user.avatar;
            obj.nickname = "匿名用户"
          }
          artData.push(obj);
        })
      }
      self.setData({
        artData: artData,
        allowLoadMore: artData.length>9,
        page: (self.data.page + 1)
      });
      if (artData.length > 0) {
        self.setData({ noArtCollect: false })
      } else {
        self.setData({ noArtCollect: true })
      }
    } else {
      let answerData = self.data.answerData;
      if (list.constructor == Array) {
        list.map(function(item) {
          // 过滤头像，昵称
          let obj = item;
          if (item.anonymous == 2) {
            // obj.avatar = user.avatar;
            obj.nickname = "匿名用户"
          }
          answerData.push(obj);
        })
      }
      self.setData({
        answerData: answerData,
        allowLoadMores: answerData.length>9,
        pages: (self.data.pages + 1)
      });
      if (answerData.length > 0) {
        self.setData({ noAnswerCollect: false })
      } else {
        self.setData({ noAnswerCollect: true })
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let self = this;
      if (self.data.currentTabsIndex == 0) {
        if (self.data.allowLoadMore) {
        self.getArtData();
        }
      }else{
        if(self.data.allowLoadMores){
          self.getAnswerData();
        }
      }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})