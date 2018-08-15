const app = getApp();
const net = require("../../utils/http.js");
const formatTime = require("../../utils/time.js");
const account = require("../../utils/account.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    commentId:'',
    title: '', //标题
    time: '', //时间
    readCount: '', //阅读数量
    praise: '', //点赞数
    content: '',
    imgsJson: [],
    commentsData: [], //评论列表
    commentsNum: '', //评论数量
    isComments: true, //是否有评论
    isWriteComment: true,
    isLike: '', //文章点赞
    page:1,
    allowLoadMore:true,
    netWork: true, //网络是否正常
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    self.getNetStatus();
    let id = Number(options.id);
    self.setData({
      id: id
    });
    //查看是否储存活动点赞历史
    let likeArray = wx.getStorageSync('activityLikeRecords');
    
    if (likeArray&&likeArray.constructor == Array) {
        //没有点赞
        if (likeArray.indexOf(self.data.commentId) == -1) {
          self.setData({
            isLike: 0
          })
        } else {
          self.setData({
            isLike: 1
          })
        }
      } else {
        self.setData({
          isLike: 0
        })
      }
  },
  onReady() {
    this.parseText = this.selectComponent("#parseText");
    this.getArticle();
    this.getCommentsList();
  },
  /**
   * 获取网络状态
   * */
  getNetStatus() {
    let self = this;
    net.netStatus(function (res) {
      self.setData({ netWork: res });
    });
  },
  /**
   * 刷新网络错误
   * */
  reloadNet() {
    this.getNetStatus();
    this.getArticle();
    this.getCommentsList();
  },
  /**
   * 获取活动详情
   */
  getArticle() {
    let self = this;
    net.http({
      url: 'ArAcInof',
      parameter: {
        multi_id: this.data.id,
        type: 1
      },
      fuSuccess(res) {
        let content = res.data.data.content;
        let imgsJson = res.data.data.imgsJson;
        let time = formatTime.formatTime(new Date(parseInt(res.data.data.update_time) * 1000));
        self.setData({
          content: content,
          imgsJson: imgsJson,
          title: res.data.data.title,
          readCount: res.data.data.views,
          praise: res.data.data.likes,
          time: time
        });
        self.parseText.parseData();
      }
    })

  },
  //获取评论列表
  getCommentsList() {
    let self = this;
    net.http({
      url: 'allCommentList',
      parameter: {
        type: 1,
        page: self.data.page,
        multi_id: self.data.id,
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          let commentLikeArray = wx.getStorageSync('activityCommentLikes');
          res.data.data.map(function(item, index) {
            //时间进制
            item.time = formatTime.transformTime(parseInt(item.create_time) * 1000);
            self.setData({commentId:item.id})
           item.like=0;
           if(commentLikeArray){
            commentLikeArray.map(function (items, indexs) {
              if (item.id == items) {
                item.like = 1;
              }
            })
           }
          })
          self.setData({
            commentsNum: res.data.allComments
          });
         self.synchData(res.data.data)
        }
      }
    })
  },
  synchData(list) {
    let self = this;
    let commentsData = self.data.commentsData;
    if (list.constructor == Array) {
      list.map(function (item) {
        commentsData.push(item);
      });
      self.setData({
        commentsData: commentsData,
        allowLoadMore: list.length > 9,
        page: self.data.page + 1
      })
    }
    if (commentsData.length > 0) {
      self.setData({
        isComments: true
      });
    } else {
      self.setData({
        isComments: false
      });
    }
  },
  //写评论
  _comments(item) {
    let self = this;
    net.http({
      url: 'allPostComment',
      parameter: {
        type: 1,
        multi_id:self.data.id,
        content:item.detail
      }, fuSuccess(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none"
        })
        self.setData({
          commentsData:[],
          page: 1,
          allowLoadMore: true
        });
        self.getCommentsList();
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none",
        })
      },
      complete() { }
    })
  },

  //文章点赞
  _setLike(event) {
    let self = this;
    let islike = event.detail;
    if (!islike || islike == 0) {
      net.http({
        url: 'allLikes',
        parameter: {
          multi_id: self.data.id,
          type: 1
        },
        fuSuccess(res) {
          //点赞量加一
          if (res.data.status == 1) {
            self.setData({
              isLike: 1,
            })
          }
          if (res.data.nums >= 10000) {
            self.setData({
              praise: Math.floor(res.data.nums / 10000).toFixed(1) + '万'
            })
          } else {
            self.setData({
              praise: res.data.nums
            })
          }
        },
        faFail(res) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })
    }
  },
  //回复评论
  _selectAllCell(item) {
    // console.log(item.detail);
    if (!account.isLogin(false, true, "../profile/profile")) { return };
    let theme = JSON.stringify(item.detail);
    theme = escape(theme)
    wx.navigateTo({
      url: '../commentDetail/commentDetail?theme=' + theme + '&type=' + 1+'&titleid='+this.data.id,
    })
  },
  //评论点赞
  _setCommentLike(event){
    if (!account.isLogin(false, true, "../profile/profile")) { return };
    let id=event.detail.id;
    let nums=event.detail.nums;
    let self=this;
    let commentsData = this.data.commentsData;
    commentsData.map(function(item,index){
      if(item.id==id){
        item.like=1;
        item.likes=nums;
        self.getCommentsList();
      }
    })
  },
  //删除评论
  _delComment(event){
    if (!account.isLogin(false, true, "../profile/profile")) { return };
    let msg=event.detail;
    this.setData({ commentsData: [], page: 1})
    this.getCommentsList() 
    wx.showToast({
      title: msg,
      icon: 'none'
    });
  },
  onReachBottom(){
    if(this.data.allowLoadMore){
      this.getCommentsList();
    }
  },
  onShareAppMessage() {
    return {
      title: this.data.title,
      path: 'pages/activityDetail/activityDetail?id=' + this.data.id
    }
  }
})