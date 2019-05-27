const Config = require('./config.js.js')
const baseUrl = Config.baseUrl;
const uploadImage = require('../../util/uploadFile/uploadFile.js');
const uploadVideo = require('../../util/uploadFile/uploadVideo.js');
const Moment = require('../../util/moment.min.js');

//api控制器
const ApiControl = require('../api/control.js.js')

/*
封装请求方法：
ApiControl 是所有的api集合
@param(apiModel, api路由,data, header)
*/


function startLoading() {
  wx.showLoading({
    title: 'Loading...',
    icon: 'none'
  })
}

function endLoading() {
  wx.hideLoading();
}
//选取API
function selectApi(file, type) {
  return ApiControl[file][type]
}

function baseRequest(url, method, data, header) {
  startLoading();
  let _data = data || {};
  let _header = header || {
    'content-type': 'application/x-www-form-urlencoded'
  };
  let _method = method || 'GET';
  let promise = new Promise(function(resolve, reject) {
    wx.request({
      url: `${baseUrl}${url}`,
      header: _header,
      data: _data,
      method: _method,
      success: function(res) {
        if (typeof res.data === "object") {
          if (res.data.status) {
            if (res.data.status !== 200) {
              console.log(res.data)
              wx.showToast({
                title: res.data.msg,
                icon: "none",
                duration: 3000
              });
              reject(res.data);
            }
          }
        }
        resolve(res.data);
      },
      fail: function(res) {
        // fail调用接口失败
        reject({
          error: '网络错误',
          code: 0
        });
      },
      complete: function() {
        endLoading()
      }
    });
  });
  return promise;
}

function baseUpload(filePath, dir = 'mini/') {
  let nowTime = Moment.formatDate(new Date(), 'yyyyMMdd');
  let promiseArr = [];
  //支持多图上传
  for (let i = 0; i < filePath.length; i++) {
    //显示消息提示框
    wx.showLoading({
      title: `上传中${(i + 1)}/${filePath.length}`,
      mask: true
    })
    //上传图片
    promiseArr.push(uploadImage(filePath[i], `${dir}${nowTime}/`))
  }
  endLoading();
  return Promise.all(promiseArr);
}

function baseUploadVideo(filePath) {
  let promiseArr = [];
  //上传视频
  promiseArr.push(uploadVideo(filePath))
  return Promise.all(promiseArr);
}

module.exports = {
  "GET": function(file, type, data, header) {
    let url = selectApi(file, type);
    return baseRequest(url, "GET", data, header);
  },
  "POST": function(file, type, data, header) {
    let url = selectApi(file, type);
    return baseRequest(url, "POST", data, header);
  },
  "UPLOAD": function(filePath, dir) {
    return baseUpload(filePath, dir);
  },
  "UPLOADVIDEO": function (filePath) {
    return baseUploadVideo(filePath);
  }
};