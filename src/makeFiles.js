var iconv = require("iconv-lite");
var FileSaver = require("file-saver");
var JSZip = require("jszip");
const dayjs = require('dayjs')

/**
 * 
 * @param {*} deviceArray 
 * devices[] 
 * devices 应该分类型：气动切断阀、定频电机、变频电机
 * 气动切断阀 应有 field: 位号，描述，流程图
 * {
    位号: 'XV250139',
    描述: '硫酸铵13#升温',
    流程图: '硫酸铵浓缩2',
    类型: '气动切断阀',
  }
 */
export function makeFiles(files, downloadName) {
  console.log("this is makeFiles.js");

  var zip = new JSZip();
  files
    .forEach((file) => {
      console.log(file);
      const gbkBuffer = iconv.encode(file.contentStr, "gbk");
      const blob = new Blob([gbkBuffer], { type: "text/csv;charset=gbk;" });
      zip.file(file.fileName, blob);
    });

  zip
    .generateAsync({
      type: "blob",
      compression: "DEFLATE", // STORE：默认不压缩 DEFLATE：需要压缩
      compressionOptions: {
        level: 1, // 压缩等级1~9    1压缩速度最快，9最优压缩方式
      },
    })
    .then((blob) => {
      FileSaver.saveAs(blob, downloadName ? downloadName : `精灵csv_${dayjs().format(`YYYYMMDD_HHmmss`)}.zip`); // 利用file-saver保存文件
    });
}
