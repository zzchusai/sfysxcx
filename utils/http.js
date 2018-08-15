const app = getApp();

const baseUrl = "https://app.sfys365.xyz/"; //设置基础url

const switchTo = function(path) {
  const length = getCurrentPages().length;
  const currentRoute = getCurrentPages()[length - 1].route;
  const pathIndex = currentRoute.split('/').length;
  let url = ""
  for (let i = 0; i < pathIndex - 2; i++) {
    url += '../'
  }
  path = url + path
  console.log(path);
  wx.switchTab({
    url: path
  })
}

let requestPayment = {
  url: "",
  parameter: { 'app_ver': '2.4.1'},
  fuSuccess: function () { },
  fuFail: function () { },
  complete: function () { },
  showToast: true,
  method: "post",
  header: { 'Accept': 'application/vnd.yunshui.v2.4.1+json', 'content-type': 'application/json' },
}
const mergeModel = function (model_1, model_2) {
  for (let k in model_2) {
    model_1[k] = model_2[k];
  }

}
const mergeRequset = function (request) {
  let token = wx.getStorageSync("token");
  if(token && token.length>0){
    requestPayment.parameter.access_token = token;
  }

  for (let key in request) {
    if (key == 'url') {
      if (request[key].indexOf("http") == -1) {
        requestPayment[key] = baseUrl + request[key];
      } else {
        requestPayment[key] = request[key];
      }
      continue;
    } else if (key == "header") {
      mergeModel(requestPayment[key], request[key]);
      continue;
    } else if (key == "parameter") {
      mergeModel(requestPayment[key], request[key]);
      continue;
    }
    requestPayment[key] = request[key];
  }
  return requestPayment;

}
const initPara = function () {
  requestPayment = {
    url: "",
    parameter: {'app_ver':'2.4.1'},
    fuSuccess: function () { },
    fuFail: function () { },
    complete: function () { },
    showToast: true,
    method: "post",
    header: { 'Accept': 'application/vnd.yunshui.v2.4.1+json', 'content-type': 'application/json' },
  };
}

//网络请求
const http = function (request) {
  initPara();
  wx.hideLoading();
  let requestPayment = mergeRequset(request);
  if (requestPayment.showToast) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  }
  wx.request({
    url: requestPayment.url,
    method: requestPayment.method,
    data: requestPayment.parameter,
    header: requestPayment.header,
    success(res) {
      if (requestPayment.showToast) {
        wx.hideLoading();
      }
      if (res.statusCode === 404) {
        requestPayment.fuFail(res);
        return;
      }
      if(res.statusCode == 200 && res.data.status == 0){
        requestPayment.fuFail(res);
        return;
      }
      if (res.statusCode == 200 && res.data.status == 99999) {
        wx.removeStorageSync("userInfo");
        wx.removeStorageSync("token");
        app.globalData.userInfo = null;
        app.globalData.token = "";
        requestPayment.fuFail(res);
        switchTo("profile/profile");
        return;
      }
      requestPayment.fuSuccess(res);
    },
    fail(res) {
      if (requestPayment.showToast) {
        wx.hideLoading();
      }
      wx.showToast({
        title: '加载失败..',
        icon: "loading"
      })
      requestPayment.fuFail(res);
    },
    complete(res) {
      netStatus();
      requestPayment.complete(res);

    }
  })
}

const netStatus = function (callBack) {
  wx.getNetworkType({
    success: function (res) {
      if (res.networkType == 'none') {
        if (typeof callBack == 'function') {
          callBack(false)
        }
        wx.showToast({
          title: '网络链接出错',
          icon: 'loading'
        });
      } else {
        if (typeof callBack == 'function') {
          callBack(true)
        }
      }
    },
    fail() {
      if (typeof callBack == 'function') {
        callBack(false)
      }
    }
  });

}

module.exports = {
  http: http, //发起请求
  netStatus: netStatus, //网络状态
  switchTo: switchTo
}