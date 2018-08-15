const recordsPath = "articleRecords";

//添加文章历史记录
const addRecords = function(id){
  let records = wx.getStorageSync(recordsPath);
  if (records.constructor != Array){
    records = new Array();
  }


  if (id && !queryRecords(id)){
    records.push(id);
  }
  wx.setStorageSync(recordsPath, records);
}

//查询文章历史记录
const queryRecords = function(id){
  let records = wx.getStorageSync(recordsPath);
  if (records.constructor != Array){
    return false;
  }
  return records.indexOf(id)>-1;
}

//记录的总数据
const getRecords = function(){
  let records = wx.getStorageSync(recordsPath);
  if (records.constructor != Array){
    return [];
  }
  return records;
}

//清空记录
const clearRecords = function(){
  wx.removeStorageSync(recordsPath);
}

module.exports = {
  addRecords: addRecords,
  queryRecords: queryRecords,
  getRecords: getRecords,
  clearRecords: clearRecords
} 