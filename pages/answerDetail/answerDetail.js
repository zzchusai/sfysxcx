const app = getApp();
const net = require("../../utils/http.js");
const time = require("../../utils/time.js");
const popup = require('../../utils/popup.js');
const account = require("../../utils/account.js");
const increaseShare = require("../../utils/increaseShareNum.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    themeDetail: {}, //主题数据
    selectList: [], //精选回答
    allList: [], //全部回答
    page: 1,
    allowLoadMore: true, //是否允许加载更多
    state: '', //收藏
    netWork: true, //网络是否正常
    isUrlChange: false,
    picImages: [],
    isComments: '',
    commentsNum: 0,
    errorTip: '该节目已经被删除了哦～',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    wx.setNavigationBarTitle({
      title: '问答详情'
    })
    this.setData({
      id: options.id
    });
    this.getTheme();
    this.getList();
    this.getNetStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},
  // 获取网络状态
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
    this.getTheme();
    this.getList();
  },
  /**
   * 准备
   * */
  onReady() {
    this.inputArea = this.selectComponent("#inputArea");
  },

  /**
   * 获取问答主题
   */
  getTheme() {
    let self = this;

    net.http({
      url: "interDetail",
      parameter: {
        interlocut_id: this.data.id
      },
      fuSuccess(res) {
        if (res.data.data.status == 1) {
          let themeDetail = res.data.data;
          themeDetail.time = time.transform(themeDetail.create_time);
          self.setData({
            themeDetail: themeDetail,
            state: res.data.data.state
          });
          let picImages = self.data.picImages;
          for (var i = 0; i < themeDetail.pic.length; i++) {
            picImages.push({
              index: i,
              currPic: themeDetail.pic[i]
            })
          }
          picImages.length = themeDetail.pic.length;
          self.setData({
            picImages: picImages
          })
        } else {
          self.setData({
            errorTip: res.data.msg,
            themeDetail: null
          });
        }
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        });
        self.setData({
          errorTip: res.data.msg,
          themeDetail: null
        });
      },
      complete() {}
    })
  },
  /**
   * 获取问答回答列表
   */
  getList() {
    let self = this;
    net.http({
      url: "answerIndex",
      parameter: {
        interlocut_id: this.data.id,
        page: this.data.page
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          //精选评论
          let commentLikeArray = wx.getStorageSync('answerCommentLikes');
          res.data.data.choice.map(function(item) {
            item.time = time.transformTime(item.create_time * 1000);
            item.like = 0;
            if (commentLikeArray) {
              commentLikeArray.map(function(items, indexs) {
                if (item.id == items) {
                  item.like = 1;
                }
              })
            }
          })

          //全部评论
          res.data.data.normal.map(function(item) {
            item.like = 0;
            item.time = time.transformTime(item.create_time * 1000);
            if (commentLikeArray) {
              commentLikeArray.map(function(items, indexs) {
                if (item.id == items) {
                  item.like = 1;
                }
              })
            }
          })
          self.synList(res.data.data.normal); //全部
          self.synLists(res.data.data.choice); // 精选
          self.setData({
            commentsNum: res.data.data.normal_count
          })
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
  /**
   * 同步信息
   */
  synList(data) {
    let self = this;
    let allList = self.data.allList;
    if (data.constructor == Array) {
      data.map(function(item) {
        allList.push(item);
      })
      self.setData({
        allList: allList,
        page: self.data.page + 1,
        allowLoadMore: data.length > 9,
      })
    }
    if (data.length > 0) {
      self.setData({
        isComments: true
      })
    } else {
      self.setData({
        isComments: false
      })
    }
  },

  synLists(data) {
    let self = this;
    let selectList = self.data.selectList;
    if (data.constructor == Array) {
      data.map(function(item) {
        selectList.push(item);
      })
      self.setData({
        selectList: selectList
      })
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.allowLoadMore) {
      this.getList();
    }
  },

  // 删除提问
  toDel() {
    if (!account.isLogin(false, true, "../profile/profile")) {
      return
    };
    let self = this;
    let comment = this.data.themeDetail;
    if (comment.canDel != 1) {
      return;
    }
    //删除弹出框
    popup.delPopup('温馨提示', '您确定要删除这个问题吗？', function() {
      net.http({
        url: "interDelete",
        parameter: {
          interlocut_id: comment.interlocut_id
        },
        fuSuccess(res) {
          if (res.data.status == 1) {
            wx.navigateBack({});
          }
        },
        fuFail(res) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })
    }, function() {
      return;
    })


  },

  /**
   * 选择精选评论
   * */
  _selectPickCell(item, idnex) {
    let theme = JSON.stringify(item.detail);
    theme = escape(theme);
    wx.navigateTo({
      url: '../commentDetail/commentDetail?theme=' + theme + '&type=' + 3 + '&titleid=' + this.data.id,
    })
  },

  /**
   * 选择全部评论的cell
   * */
  _selectAllCell(item) {
    let theme = JSON.stringify(item.detail);
    theme = escape(theme);
    wx.navigateTo({
      url: '../commentDetail/commentDetail?theme=' + theme + '&type=' + 3 + '&titleid=' + this.data.id,
    })
  },

  /**
   * 点赞
   * */
  /**
   * 发表评论
   * */
  _comments(item) {
    if (!account.isLogin(false, true, "../profile/profile")) {
      return
    };
    let self = this;
    net.http({
      url: "answerSave",
      parameter: {
        interlocut_id: this.data.id,
        content: item.detail
      },
      fuSuccess(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none"
        })
        self.setData({
          selectList: [],
          allList: [],
          page: 1,
          allowLoadMore: true
        });
        self.getList();
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
  //问答关注
  _setCollect(event) {
    if (!account.isLogin(false, true, "../profile/profile")) {
      return
    };
    let self = this;
    let multi_id = event.detail;
    net.http({
      url: "interCollect",
      parameter: {
        interlocut_id: multi_id
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          self.setData({
            state: 1
          })
        }
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none",
        })
      }
    })
  },
  //取消问答关注
  _cancelCollect(event) {
    if (!account.isLogin(false, true, "../profile/profile")) {
      return
    };
    let self = this;
    let multi_id = event.detail;
    net.http({
      url: "interUcollect",
      parameter: {
        interlocut_id: multi_id
      },
      fuSuccess(res) {
        self.setData({
          state: 0
        })
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none",
        })
      }
    })
  },
  //主评论点赞
  _setCommentLike(event) {
    let self = this;
    let id = event.detail.id;
    let nums = event.detail.nums;
    let allList = this.data.allList;
    allList.map(function(item, index) {
      if (item.id == id) {
        item.like = 1;
        item.likes = nums;
        self.getList();
      }
    })
  },
  //评论点赞
  _setCommentLikes(event) {
    if (!account.isLogin(false, true, "../profile/profile")) {
      return
    };
    let self = this;
    let id = event.detail.id;
    let nums = event.detail.nums;
    let selectList = this.data.selectList;
    selectList.map(function(item, index) {
      if (item.id == id) {
        item.like = 1;
        item.likes = nums;
        self.getList()
      }
    })
  },
  //删除评论
  _delComment(event) {
    if (!account.isLogin(false, true, "../profile/profile")) {
      return
    };
    let self = this;
    let msg = event.detail;
    this.setData({
      allList: [],
      selectList: [],
      page: 1
    })
    this.getList()
    wx.showToast({
      title: msg,
      icon: 'none'
    });
  },
  //点击图片放大
  imgYu(event) {
    let self = this;
    var src = event.currentTarget.dataset.src; //获取data-src
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: self.data.themeDetail.pic // 需要预览的图片http链接列表
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    let self = this;
    return {
      title: this.data.themeDetail.title,
      path: 'pages/answerDetail/answerDetail?id=' + this.data.id,
      success() {
        increaseShare.increaseDetailAnswer(self.data.id);
      }
    }
  },
  // 极有可能是返回上一页
  onUnload() {
    let self = this;
    let pages = getCurrentPages();
    if (pages.length <= 1) {
      return;
    }
    let prePages = pages[pages.length - 2];
    if (prePages.route.endWith('answer') || prePages.route.endWith('myQuestion')) {
      let rootId = this.data.id;
      let views = '';
      let selectNum = '';
      let allNum = '';
      let answer_nums = '';
      let answerData = prePages.data.answerData;
      if (self.data.themeDetail) {
        views = self.data.themeDetail.views; //阅读量
        selectNum = self.data.selectList.length; //精选回答
        allNum = self.data.commentsNum; //全部回答
        answer_nums = parseInt(allNum) + parseInt(selectNum); //回答数量
      }
      let mutableData = prePages.data.mutableData;
      for (let i = 0; i < mutableData.length; i++) {
        let item = mutableData[i];
        if (item.interlocut_id == rootId) {
          item.views = views;
          item.answer_nums = answer_nums;
          break;
        }
        if (self.data.errorTip == '提问违规') {
          mutableData.splice(index, 1)
        }
      }
      prePages.setData({
        mutableData: mutableData
      });
    } else if (prePages.route.endWith('myCollection')) {
      let rootId = this.data.id;
      let views = '';
      let selectNum = '';
      let allNum = '';
      let answer_nums = '';
      let answerData = prePages.data.answerData;
      if (self.data.themeDetail) {
        views = self.data.themeDetail.views; //阅读量
        selectNum = self.data.selectList.length; //精选回答
        allNum = self.data.commentsNum; //全部回答
        answer_nums = parseInt(allNum) + parseInt(selectNum); //回答数量
      }
      answerData.map(function(item, index) {
        if (item.interlocut_id == rootId) {
          item.views = views;
          item.answer_nums = answer_nums;
          if (self.data.errorTip == '提问违规') {
            answerData.splice(index, 1)
          }
        }
      })
      prePages.setData({
        answerData: answerData
      });
    }


  }
})