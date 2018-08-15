const app = getApp();
const net = require("../../utils/http.js");


Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    allowLoadMore: true, //是否允许加载更多
    mutableData: [],
    user_id: 0,
    netWork: true, //网络是否正常
    isCollect: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userInfo = JSON.parse(wx.getStorageSync("userInfo"));
    if (userInfo) {
      this.setData({
        page: 1,
        mutableData: [],
        allowLoadMore: true,
        user_id: userInfo.id
      });
    } else {
      this.setData({
        page: 1,
        mutableData: [],
        allowLoadMore: true
      });
    }
    this.getNetStatus();
    this.getListData();
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
    this.getListData();
  },


  /**
   * 获取列表数据
   */
  getListData() {
    let self = this;
    net.http({
      url: "userCenterAskList",
      parameter: {
        page: self.data.page,
        user_id: this.data.user_id
      },
      fuSuccess(res) {
        if (res.data.status==1) {
          self.synchData(res.data.data, res.data.user);
        }
      }
    })
  },

  /**
   * 同步数据 
   * */
  synchData(list, user) {
    let self=this;
    let mutableData = self.data.mutableData;
    if (list.constructor == Array) {
      list.map(function(item) {
        // 过滤头像，昵称
        let obj = item;
        if (item.anonymous == 2) {
          obj.avatar = user.avatar;
          obj.nickname = "匿名用户"
        }
        mutableData.push(obj);
      })
      self.setData({
        mutableData: mutableData,
        allowLoadMore: list.length > 9,
        page: (self.data.page + 1)
      });
    }
    if(mutableData.length>0){
      self.setData({isCollect:true})
    }else{
      self.setData({ isCollect: false })
    }
  },
  toMyQuestionDetail(event) {
    wx.navigateTo({
      url: '../answerDetail/answerDetail?id=' + event.currentTarget.dataset.index,
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.allowLoadMore) {
      this.getListData();
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})