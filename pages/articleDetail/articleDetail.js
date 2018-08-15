const app = getApp();
const net = require("../../utils/http.js");
const formatTime = require("../../utils/time.js");
const likeRecord = require('../../utils/likeRecords.js');
const account = require("../../utils/account.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    title: '', //标题
    author: '', //作者
    time: '', //时间
    readCount: '', //阅读数量
    praise: '', //点赞数
    content: '',
    imgsJson: [],
    commentsData: [], //评论列表
    commentsNum: '', //评论数量
    isComments: true, //是否有评论
    isWriteComment: true,
    collectStatus: '',
    isLike: '', //文章是否点赞
    isLogin: '',
    commentLike: '', //评论点赞
    netWork: true, //网络是否正常
    page: 1,
    allowLoadMore: true,
    isDel:false,  //文章是否被删除
    errorTip:''  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getNetStatus();
    let self = this;
    let id = Number(options.id);
    //是否登录
    let user = wx.getStorageSync('token')
    if (user) {
      self.setData({
        isLogin: true
      })
    } else {
      self.setData({
        isLogin: false
      })
    }
    this.setData({
      id: id
    });
    //查看是否储存文章点赞历史
    let likeArray = wx.getStorageSync('articleLikeRecords');
    if (likeArray && likeArray.constructor == Array) {
      //没有点赞
      if (likeArray.indexOf(id) == -1) {
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
  /**
   * 获取网络状态
   * */
  getNetStatus() {
    let self = this;
    net.netStatus(function(res) {
      console.log(res);
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
    this.getArticle();
    this.getCommentsList();
  },

  onReady() {
    this.parseText = this.selectComponent("#parseText");
    this.getArticle();
    this.getCommentsList();
  },
  /**
   * 获取文章详情
   */
  getArticle() {
    let self = this;
    net.http({
      url: 'ArAcInof',
      parameter: {
        multi_id: this.data.id,
        type: 2
      },
      fuSuccess(res) {
        let content = res.data.data.content;
        let imgsJson = res.data.data.imgsJson;
        let time = formatTime.formatTime(new Date(parseInt(res.data.data.update_time) * 1000));
        if (res.data.data.title){
        self.setData({
          collectStatus: res.data.data.collectStatus,
          content: content,
          imgsJson: imgsJson,
          title: res.data.data.title,
          author: res.data.data.author,
          readCount: res.data.data.views,
          praise: res.data.data.likes,
          time: time
        });
        }
        self.parseText.parseData();
      },
      fuFail(res){
        console.log(res);
      },
      complete() {
        self.preRefresh();
      }
    })
  },
  //获取评论列表
  getCommentsList() {
    let self = this;
    net.http({
      url: 'allCommentList',
      parameter: {
        type: 2,
        page: self.data.page,
        multi_id: self.data.id,
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          let commentLikeArray = wx.getStorageSync('acticleCommentLikes');
          res.data.data.map(function(item, index) {
            //时间进制
            item.time = formatTime.transformTime(parseInt(item.create_time) * 1000);
            item.like = 0;
            if (commentLikeArray) {
              commentLikeArray.map(function(items, indexs) {
                if (item.id == items) {
                  item.like = 1;
                }
              })
            }
          })
          self.setData({
            commentsNum: res.data.allComments,
          })
          self.synchData(res.data.data)
        }
      },
      fuFail(res) {
        if(res.data.msg!=''){
          self.setData({
            isDel:true,
            errorTip:res.data.msg
          })
        }else{
          self.setData({
            isDel: false
          })
        }
      },
      complete() {
        self.preRefresh();
      }
    })
  },
  synchData(list) {
    let self = this;
    let commentsData = self.data.commentsData;
    if (list.constructor == Array) {
      list.map(function(item) {
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
  //发表评论
  _comments(item) {
    let self = this;
    net.http({
      url: 'allPostComment',
      parameter: {
        type: 2,
        multi_id: self.data.id,
        content: item.detail
      },
      fuSuccess(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none"
        })
        self.setData({
          commentsData: [],
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
      complete() {}
    })
  },
  //收藏
  _setCollect(event) {
    let self = this;
    let type = event.detail.type;
    let multi_id = event.detail.multi_id;
    net.http({
      url: 'ArAcCollect',
      parameter: {
        type: type,
        multi_id: multi_id
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          self.setData({
            collectStatus: 1
          })
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
  //取消收藏
  _cancelCollect(event) {
    let self = this;
    let type = event.detail.type;
    let multi_id = event.detail.multi_id;
    net.http({
      url: 'cancelArAcCollect',
      parameter: {
        multi_id: multi_id
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          self.setData({
            collectStatus: 0
          })
        }
      }
    })
  },
  //点赞
  _setLike(event) {
    let self = this;
    let islike = event.detail;
    if (!islike || islike == 0) {
      net.http({
        url: 'allLikes',
        parameter: {
          multi_id: self.data.id,
          type: 2
        },
        fuSuccess(res) {
          //点赞量加一
          if (res.data.status == 1) {
            self.setData({
              isLike: 1,
            })
            if(res.data.nums>=10000){
              self.setData({
                praise:Math.floor(res.data.nums/10000).toFixed(1)+'万'
              })
            }else{
              self.setData({
                praise: res.data.nums
              })
            }
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
  //选择评论
  _selectAllCell(item) {
    let theme = JSON.stringify(item.detail);
    theme = escape(theme)
    wx.navigateTo({
      url: '../commentDetail/commentDetail?theme=' + theme + '&type=' + 2 + '&titleid=' + this.data.id,
    })
  },
  _setCommentLike(event) {
    let id = event.detail.id;
    let nums = event.detail.nums;
    let self = this;
    let commentsData = this.data.commentsData;
    commentsData.map(function(item, index) {
      if (item.id == id) {
        item.like = 1;
        item.likes = nums;
        self.getCommentsList()
      }
    })
  },
  getIndex(event) {
    console.log(event.currentTarget.dataset.index)
  },
  onReachBottom() {
    if (this.data.allowLoadMore) {
      this.getCommentsList();
    }
  },
  //删除评论 
  _delComment(event) {
    let self = this;
    let msg = event.detail;
    this.setData({
      commentsData: [],
      page: 1
    })
    this.getCommentsList()
    wx.showToast({
      title: msg,
      icon: 'none'
    });
  },
  onShareAppMessage() {
    return {
      title: this.data.title,
      path: 'pages/articleDetail/articleDetail?id=' + this.data.id
    }
  },
  //返回我的收藏刷新
  preRefresh() {
    let self = this;
    let pages = getCurrentPages();
    if (pages.length > 1) {
      let prePage = pages[pages.length - 2];
      if (prePage.route.endWith('myCollection')) {
        let artData = prePage.data.artData;
        if (artData&&artData.length>0) {
          artData.map(function (item,index) {
            if (item.id == self.data.id && self.data.readCount != '') {
              item.views = self.data.readCount;
              item.comment_nums = self.data.commentsNum
              if(self.data.isDel){
                 artData.splice(index,1)
              }
            }
          })
        }
        prePage.setData({ artData: artData });
      } else if (prePage.route.endWith('home')) {
        let mutableData = prePage.data.mutableData;
        if(mutableData&&mutableData.length>0){
       mutableData.map(function(item,index){
         if (item.id == self.data.id && self.data.readCount != ''){
           item.views=self.data.readCount;
           item.comment_nums=self.data.commentsNum
         }
       })
        }
        prePage.setData({ mutableData: mutableData});
      } else if (prePage.route.endWith('search')) {
        let hotartData = prePage.data.hotartData;
        if (hotartData) {
          hotartData.map(function (item, index) {
            if (item.id == self.data.id&&self.data.readCount!='') {
              item.views = self.data.readCount;
              item.comment_nums = self.data.commentsNum
            }
          })
        }
        prePage.setData({ hotartData: hotartData });
      }
    }
  }
})