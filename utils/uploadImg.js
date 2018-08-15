/**
 * 七牛云上传图片
 * 2018-07-10
 * */ 
const net = require("./http.js");
const qiniuUploader = require("../third/qiniuUploader.js");
const region =  "ECN";
let domain = "";
let uptoken = "";


function getPar(callback, imgCount, fuSuccess, fuFail){
  net.http({
    url: "rollback_pic",
    fuSuccess(res) {
      domain = res.data.onlineUrl;
      uptoken = res.data.utoken;
      callback(imgCount, fuSuccess, fuFail);
    },
    complete() {
    }
  })

}


/**
 * 选择图片
 * */
let chooseImgs = function (imgArray, fuSuccess, fuFail) {
  synQiniu(imgArray, fuSuccess, fuFail);
}

/**
 * 上传图片
 * imgCount 图片数组  
 * fuSuccess 成功回调
 * fuFail 失败回调
 * */ 
let uploadImg = function(imgArray,fuSuccess,fuFail){
  getPar(chooseImgs, imgArray, fuSuccess, fuFail);
 
}


/**
 * 单张图片上传
 * */ 

function thread(img){
  return new Promise((resolve,reject)=>{
    qiniuUploader.upload(img, (res) => {
      resolve(res.imageURL);  
    }, (error) => {
      reject(error);
    }, {
        region: region,
        domain: domain,
        uptoken: uptoken
      })



  })

}



/**
 * 将数据同步到七牛
 * imgArray 图片地址数组
 * fuSuccess 成功回调
 * fuFail 失败回调
 * */ 
function synQiniu(imgArray, fuSuccess, fuFail){
    let threads = [];
    imgArray.map(function(item){
      threads.push(thread(item));
    });
    wx.showLoading({
      title: '上传中...',
    })
    Promise.all(threads).then(v=>{
      if(typeof(fuSuccess) == "function"){
        fuSuccess(v);
      }
      wx.hideLoading();
    }).catch((res)=>{
      if (typeof (fuFail) == "function") {
        fuFail(res);
      }
      wx.hideLoading();
    })
}

module.exports = {
  uploadImg: uploadImg,
}


