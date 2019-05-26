const env = require('config.js'); //配置文件，在这文件里配置你的OSS keyId和KeySecret,timeout:87600;

const base64 = require('base64.js'); //Base64,hmac,sha1,crypto相关算法
require('hmac.js');
require('sha1.js');
const Crypto = require('crypto.js');

/*
 *上传文件到阿里云oss
 *@param - filePath :图片的本地资源路径
 *@param - dir:表示要传到哪个目录下
 */
const uploadFile = function (filePath) {
  console.log('上传视频.....');
  //图片名字 可以自行定义，     这里是采用当前的时间戳 + 150内的随机数来给图片命名的
  var stringFilePath = String(filePath);
  var indexType = stringFilePath.lastIndexOf('.');
  var type = stringFilePath.substring(indexType);
  const aliyunFileKey = 'video/' + new Date().getTime() + Math.floor(Math.random() * 1000) + type;//随机1000内的数加上时间戳作为你存放在阿里云video目录下名字和类型。

  const aliyunServerURL = env.uploadImageUrl; //OSS地址，需要https
  const aliyunImageHost = env.imageUrl; // OSS地址，
  const accessid = env.OSSAccessKeyId;
  const policyBase64 = getPolicyBase64();
  const signature = getSignature(policyBase64); //获取签名
  let promise = new Promise(function (resolve, reject) {
    wx.uploadFile({
      url: aliyunServerURL, //开发者服务器 url
      filePath: filePath, //要上传文件资源的路径
      name: 'file', //必须填file
      formData: {
        'key': aliyunFileKey,
        'policy': policyBase64,
        'OSSAccessKeyId': accessid,
        'signature': signature,
        'success_action_status': '200',
      },
      success: function (res) {
        if (res.statusCode != 200) {
          resolve(new Error('上传错误:' + JSON.stringify(res)))
          return;
        }
        resolve(aliyunImageHost + aliyunFileKey);
      },
      fail: function (err) {
        err.wxaddinfo = aliyunServerURL;
        resolve(err);
      },
    })
  })
  return promise;
}

const getPolicyBase64 = function () {
  let date = new Date();
  date.setHours(date.getHours() + env.timeout);
  let srcT = date.toISOString();
  const policyText = {
    "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了 
    "conditions": [
      ["content-length-range", 0, 50 * 1024 * 1024] // 设置上传文件的大小限制,5mb
    ]
  };

  const policyBase64 = base64.encode(JSON.stringify(policyText));
  return policyBase64;
}

const getSignature = function (policyBase64) {
  const accesskey = env.AccessKeySecret;

  const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
    asBytes: true
  });
  const signature = Crypto.util.bytesToBase64(bytes);

  return signature;
}

module.exports = uploadFile;