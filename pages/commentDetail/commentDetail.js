const app = getApp();
const net = require("../../utils/http.js");
const time = require("../../utils/time.js");


Page({

  /**
   * 页面的初始数据
   */
  data: {
    themeList: [], //评论的主题
    id: 0, //评论id
    titleId: '', //文章、活动或问答id
    allList: [], //全部品论
    page: 1,
    allowLoadMore: true, //是否允许加载更多
    editPlaceholder: '', //输入框的占位符
    type: '', //类型 3代表活动评论 4代表文章评论 5代表问答评论
    replyId: '',
    netWork: true, //网络是否正常
    isOwn: false, //is self
    isfocus: '', //是否弹起输入框
    isComments: true, //是否有评论
    commentsNum: '', //评论总数
    errorTip:'',
    noError:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let theme = options.theme;
    let paseTheme = null;
    if (theme){
      paseTheme = unescape(theme);
    }   
    if (theme && paseTheme && JSON.parse(paseTheme).constructor == Object) {
      let theme = JSON.parse(paseTheme);
      let nickname = '回复' + theme.nickname;
      this.setData({
        id: theme.id,
        replyId: theme.id,
        editPlaceholder: nickname,
        type: Number(options.type) + 2,
        titleId: Number(options.titleid),
        allowLoadMore: true
      });
      //是否弹起输入框
      if (theme.comments > 0) {
        self.setData({
          isfocus: false
        })
      } else {
        // self.setData({
        //   isfocus: true
        // })
      }
    }
    this.getNetStatus();
  },
  // 获取网络状态
  getNetStatus() {
    let self = this;
    net.netStatus(function (res) {
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
    this.onReady();
  },
  onReady() {
    let self = this;
    if (self.data.type == 3) {
      self.getActivityData();
    } else if (self.data.type == 4) {
      self.getActicleData();
    } else if (self.data.type == 5) {
      self.getListData();
    }
  },
  //获取活动评论
  getActivityData() {
    let self = this;
    net.http({
      url: "allCommentInfo",
      parameter: {
        pmulti_id: self.data.id,
        page: self.data.page,
        type: 1
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          //主评论
          let commentLikeArray = wx.getStorageSync('activityCommentLikes');
          let themeList = self.data.themeList;
          themeList.push(res.data.data.comment);
          themeList.map(function(item) {
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
          themeList.unshift(themeList[themeList.length - 1]);
          themeList.length = 1;
          self.setData({
            themeList: themeList,
            commentsNum: themeList[0].comments,
            noError: true
          })
          //全部评论
          res.data.data.comment_children.map(function(item) {
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
          self.synList(res.data.data.comment_children); //全部
        }
      },
      fuFail(res){
        if (res) {
          self.setData({
            noError: false,
            errorTip: res.data.msg
          })
        }

      },
      complete() {
        self.preRefresh();
      }
    })
  },
  //获取文章评论
  getActicleData() {
    let self = this;
    net.http({
      url: "allCommentInfo",
      parameter: {
        pmulti_id: self.data.id,
        page: self.data.page,
        type: 2
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          let commentLikeArray = wx.getStorageSync('acticleCommentLikes');
          //主评论
          let themeList = self.data.themeList;
          themeList.push(res.data.data.comment);
          themeList.map(function(item) {
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
          themeList.unshift(themeList[themeList.length - 1]);
          themeList.length = 1;
          self.setData({
            themeList: themeList,
            commentsNum: themeList[0].comments,
            noError: true
          })
          //全部评论
          res.data.data.comment_children.map(function(item) {
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
          self.synList(res.data.data.comment_children); //全部
        }
      },
      fuFail(res) {
        if(res){
        self.setData({
          noError: false,
          errorTip: res.data.msg
        })
        }
      },
      complete() {
        self.preRefresh();
      }
    })
  },
  /**
   * 获取问答评论精选列表
   * */
  getListData() {
    let self = this;
    net.http({
      url: "answerDetail",
      parameter: {
        answer_id: this.data.id,
        page: this.data.page
      },
      fuSuccess(res) {
        if (res.data.status == 1) {
          let commentLikeArray = wx.getStorageSync('answerCommentLikes');
          //主评论
          let themeList = self.data.themeList;
          themeList.push(res.data.data.answer);
          themeList.map(function(item) {
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
          themeList.length = 1;
          self.setData({
            themeList: themeList,
            commentsNum: res.data.data.answer.comments,
            noError: true
          })
          let title = res.data.data.answer.comments > 0 ? res.data.data.answer.comments + "条回复" : "暂无回复";
          wx.setNavigationBarTitle({
            title: title
          })
          //全部评论
          res.data.data.answer_child.map(function(item) {
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
          self.synList(res.data.data.answer_child); //全部
        }
      },
      fuFail(res) {
        if (res) {
          self.setData({
            noError: false,
            errorTip: res.data.msg
          })
        }

      },
      complete() {
        self.preRefresh();
      }
    })
  },
  //点击主评论
  selectCell() {
    let self = this;
    self.setData({
      replyId: self.data.id,
      editPlaceholder: '回复' + self.data.themeList[0].nickname,
      isfocus: true
    })
  },
  /**
   * 同步数据
   */
  synList(data) {
    let self = this;
    let allList = self.data.allList;
    // if (data.constructor == Array) {
    data.map(function(item) {
      allList.push(item);
    })
    self.setData({
      allList: allList,
      page: self.data.page + 1,
      allowLoadMore: allList.length > 9,
    })
    if (allList.length > 0) {
      self.setData({
        isComments: true
      })
    } else {
      self.setData({
        isComments: false
      })
    }
    // }
  },

  /**
   * 点击评论
   * */
  _selectAllCell(item) {
    this.setData({
      editPlaceholder: '回复' + item.detail.nickname,
      replyId: item.detail.id,
      isfocus: true
    });
  },


  /**
   * 回复xxxx
   * */
  _reply(item) {
    let self = this;
    let obj = item.detail;
    if (self.data.type == 3) {
      net.http({
        url: 'allReplyComment',
        parameter: {
          multi_id: self.data.titleId,
          type: 1,
          pmulti_id: self.data.replyId,
          content: item.detail.reply
        },
        fuSuccess(res) {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
          self.setData({
            allList: [],
            page: 1,
            allowLoadMore: true,
            replyId: self.data.id,
            editPlaceholder: '回复' + self.data.themeList[0].nickname
          });
          self.getActivityData();
        },
        fuFail(res) {
          if (res.data.msg) {
            wx.showToast({
              title: res.data.msg,
              icon: "none",
            })
          }
        },
        complete() {}
      })
    } else if (self.data.type == 4) {
      net.http({
        url: 'allReplyComment',
        parameter: {
          multi_id: self.data.titleId,
          type: 2,
          pmulti_id: self.data.replyId,
          content: item.detail.reply
        },
        fuSuccess(res) {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
          self.setData({
            allList: [],
            page: 1,
            allowLoadMore: true,
            replyId: self.data.id,
            editPlaceholder: '回复' + self.data.themeList[0].nickname
          });
          self.getActicleData();
        },
        fuFail(res) {
          if (res.data.msg) {
            wx.showToast({
              title: res.data.msg,
              icon: "none",
            })
          }
        },
        complete() {}
      })
    } else if (self.data.type == 5) {
      net.http({
        url: 'allReplyComment',
        parameter: {
          multi_id: self.data.titleId,
          type: 5,
          pmulti_id: self.data.replyId,
          content: item.detail.reply
        },
        fuSuccess(res) {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
          self.setData({
            allList: [],
            page: 1,
            allowLoadMore: true,
            replyId: self.data.id,
            editPlaceholder: '回复' + self.data.themeList[0].nickname
          });
          self.getListData();
        },
        fuFail(res) {
          if(res.data.msg){
          wx.showToast({
            title: res.data.msg,
            icon: "none",
          })
          }
        },
        complete() {}
      })

    }
    this.setData({
      editPlaceholder: '回复' + this.data.themeList[0].nickname
    });
  },
  //主评论点赞
  _setCommentLike(event) {
    let self = this;
    let id = event.detail.id;
    let nums = event.detail.nums;
    let themeList = self.data.themeList;
    themeList.map(function(item, index) {
      if (item.id == id) {
        item.likes = nums;
        if (self.data.type == 3) {
          self.getActivityData();
        } else if (self.data.type == 4) {
          self.getActicleData();
        } else if (self.data.type == 5) {
          self.getListData();
        }
      }
    })
  },
  //评论点赞
  _setCommentLikes(event) {
    let self = this;
    let id = event.detail.id;
    let nums = event.detail.nums;
    let allList = this.data.allList;
    allList.map(function(item, index) {
      if (item.id == id) {
        item.like = 1;
        item.likes = nums;
        if (self.data.type == 3) {
          self.getActivityData();
        } else if (self.data.type == 4) {
          self.getActicleData();
        } else if (self.data.type == 5) {
          self.getListData();
        }
      }
    })
  },

  //删除主评论
  _delComment(event) {
    let self = this;
    let msg = event.detail;
    wx.navigateBack()
    if (self.data.type == 3) {
      //返回上一页刷新
      let pages = getCurrentPages();
      if (pages.length > 1) {
        let prePages = pages[pages.length - 2];
        prePages.setData({
          commentsData: [],
          page: 1
        });
        prePages.getCommentsList();
      }
    } else if (self.data.type == 4) {
      //返回上一页刷新
      let pages = getCurrentPages();
      if (pages.length > 1) {
        let prePages = pages[pages.length - 2];
        prePages.setData({
          commentsData: [],
          page: 1
        });
        prePages.getCommentsList();
      }
    } else if (self.data.type == 5) {
      //返回上一页刷新
      let pages = getCurrentPages();
      if (pages.length > 1) {
        let prePages = pages[pages.length - 2];
        prePages.setData({
          allList: [],
          page: 1,
          selectList: []
        });
        prePages.getTheme();
        prePages.getList();
      }
    }

    this.setData({
      allList: [],
      page: 1
    })
    if (self.data.type == 3) {
      self.getActivityData();
    } else if (self.data.type == 4) {
      self.getActicleData();
    } else if (self.data.type == 5) {
      self.getListData();
    }
    wx.showToast({
      title: msg,
      icon: 'none'
    });
  },

  //删除评论
  _delComments(event) {
    let self = this;
    let msg = event.detail;
    this.setData({
      allList: [],
      page: 1
    })
    if (self.data.type == 3) {
      self.getActivityData();
    } else if (self.data.type == 4) {
      self.getActicleData();
    } else if (self.data.type == 5) {
      self.getListData();
    }
    wx.showToast({
      title: msg,
      icon: 'none'
    });
  },
  // 上一页刷新
  preRefresh() {
    let self = this;
    //返回上一页刷新
    let pages = getCurrentPages();
    if (pages.length > 1) {
      let prePages = pages[pages.length - 2];
      if (prePages.route.endWith('activityDetail')) {
        let commentsData = prePages.data.commentsData;
        let themeList = self.data.themeList;
        if (commentsData&&commentsData.length>0) {
          commentsData.map(function(item, index) {
            if (item.id == self.data.id) {
              item.comments = self.data.commentsNum;
              item.like = themeList[0].like;
              item.likes = themeList[0].likes;
            }
          })
          prePages.setData({
            commentsData: commentsData
          })
        }
      } else if (prePages.route.endWith('articleDetail')) {
        let commentsData = prePages.data.commentsData;
        let themeList = self.data.themeList;
        if (commentsData&&commentsData.length>0) {
          commentsData.map(function(item) {
            if (item.id == self.data.id) {
              item.comments = self.data.commentsNum;
              item.like = themeList[0].like;
              item.likes = themeList[0].likes;
            }
          })
        }
        prePages.setData({
          commentsData: commentsData
        })
      } else if (prePages.route.endWith('answerDetail')) {
        let selectList = prePages.data.selectList;
        let allList = prePages.data.allList;
        let themeList = self.data.themeList;
        if (selectList&&selectList.length>0) {
          selectList.map(function(item) {
            if (item.id == self.data.id) {
              item.comments = self.data.commentsNum;
              item.likes = themeList[0].likes;
              item.like = themeList[0].like;
            }
          })
        }
        if (allList&&allList.length>0) {
          allList.map(function(item) {

            if (item.id == self.data.id) {
              item.comments = self.data.commentsNum;
              item.likes = themeList[0].likes;
              item.like = themeList[0].like;
            }
          })
        }
        prePages.setData({
          selectList: selectList,
          allList: allList
        })
      }
    }
  },
  /**
   * 上拉刷新
   */
  onReachBottom() {
    let self = this;
    console.log('ok');
    if (this.data.allowLoadMore) {
      if (this.data.type == 3) {
        this.getActivityData()
      } else if (this.data.type == 4) {
        this.getActicleData()
      } else if (this.data.type == 5) {
        this.getListData();
      }
    }
  },

})