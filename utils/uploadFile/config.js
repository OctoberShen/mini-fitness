var requestHost = "https://img.mfhyuan.com/"; 
var fileHost = "http://img.mfhyuan.com/";
var config = {
  //aliyun OSS config
  uploadImageUrl: `${requestHost}`, // 默认存在根目录，可根据需求改
  imageUrl: `${fileHost}`,
  AccessKeySecret: 't1WNNdqIGTnWs2q9o7LDeLT7Owpmnm', // AccessKeySecret 去你的阿里云上控制台上找
  OSSAccessKeyId: 'LTAIon2JeaL07wxq', // AccessKeyId 去你的阿里云上控制台上找
  timeout: 87600 //这个是上传文件时Policy的失效时间
};
module.exports = config