var iconv = require('iconv-lite');
var FileSaver = require('file-saver');

export function make1file() {
  console.log("this is make1file.js");

  const 设备 = {
    名称: "205_038_硫酸铵浓缩2_XV250140",
    描述: "硫酸铵14#升温",
    关联: "<ROOT>\\Object\\205_038_气动阀.dsg",
    数据个数: "3",
    文件名: "205_038_硫酸铵浓缩2_XV250140",
    位号: "XV250140",
    保存文件名: "205_038_硫酸铵浓缩2_XV250140.csv"
  };

  const csv模板 = `版本号,260
名称,${设备.名称}
描述,${设备.描述}
关联,${设备.关联}
数据个数,${设备.数据个数}
[CSV],	,	${设备.文件名},	,	,	,	
[气动切断阀],	,	${设备.位号},	,	,	,	
[设备描述],	,	${设备.描述},	,	,	,	`;

  console.log(csv模板);

  const gbkBuffer = iconv.encode(csv模板, 'gbk');
  var myBlob = new Blob([gbkBuffer], { type: 'text/csv;charset=gbk;' });
  FileSaver.saveAs(myBlob, 设备.保存文件名);

}
