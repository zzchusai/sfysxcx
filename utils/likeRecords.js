//点赞记录
let recordsPath = "";

//添加点赞历史记录
const addLikeRecords = function(id, types) {
  if (types == 1) {
    recordsPath = 'activityLikeRecords'
  } else if (types == 2) {
    recordsPath = 'articleLikeRecords'
  } else if (types == 3) {
    recordsPath = 'activityCommentLikes'
  } else if (types == 4) {
    recordsPath = 'acticleCommentLikes'
  } else if (types == 5) {
    recordsPath = 'answerCommentLikes'
  }
  let records = wx.getStorageSync(recordsPath);
  if (records.constructor != Array) {
    records = new Array();
  }
  if (id && records) {
    if (records.indexOf(id) != -1) {
      wx.showToast({
        title: '您已经点赞过了！',
        icon: 'none'
      })
    } else {
      records.push(id);
    }
  }
  wx.setStorageSync(recordsPath, records);
}

//查询点赞记录
const queryLikeRecords = function(id, isLike, types) {
  if (types == 1) {
    recordsPath = 'activityLikeRecords'
  } else if (types == 2) {
    recordsPath = 'articleLikeRecords'
  } else if (types == 3) {
    recordsPath = 'activityCommentLikes'
  } else if (types == 4) {
    recordsPath = 'acticleCommentLikes'
  } else if (types == 5) {
    recordsPath = 'answerCommentLikes'
  } 
  let self = this;
  let records = wx.getStorageSync(recordsPath);
  if (records.constructor != Array) {
    return false;
  }
  return records.indexOf(id) > -1;
}

//记录的总数据
const getLikeRecords = function(types) {
  if (types == 1) {
    recordsPath = 'activityLikeRecords'
  } else if (types == 2) {
    recordsPath = 'articleLikeRecords'
  } else if (types == 3) {
    recordsPath = 'activityCommentLikes'
  } else if (types == 4) {
    recordsPath = 'acticleCommentLikes'
  } else if (types == 5) {
    recordsPath = 'answerCommentLikes'
  }
  let records = wx.getStorageSync(recordsPath);
  if (records.constructor != Array) {
    return [];
  }
  return records;
}

//删除一条点赞记录

//清空点赞记录
const clearLikeRecords = function(types) {
  if (types == 1) {
    recordsPath = 'activityLikeRecords'
  } else if (types == 2) {
    recordsPath = 'articleLikeRecords'
  } else if (types == 3) {
    recordsPath = 'activityCommentLikes'
  } else if (types == 4) {
    recordsPath = 'acticleCommentLikes'
  } else if (types == 5) {
    recordsPath = 'answerCommentLikes'
  }
  wx.removeStorageSync(recordsPath);
}

module.exports = {
  addLikeRecords: addLikeRecords,
  queryLikeRecords: queryLikeRecords,
  getLikeRecords: getLikeRecords,
  clearLikeRecords: clearLikeRecords
}