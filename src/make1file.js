var iconv = require('iconv-lite');
var FileSaver = require('file-saver');

export function make1file() {
  console.log("this is make1file.js");

  const ob1 = {
    位号: 'XV250139',
    描述: '硫酸铵13#升温',
    流程图: '硫酸铵浓缩2',
  }

  const 设备 = {
    名称: `205_038_${ob1.流程图}_${ob1.位号}`,
    描述: `${ob1.描述}`,
    关联: "<ROOT>\\Object\\205_038_气动阀.dsg",
    数据个数: "3",
    文件名: `205_038_${ob1.流程图}_${ob1.位号}`,
    位号: `${ob1.位号}`,
    保存文件名: `205_038_${ob1.流程图}_${ob1.位号}.csv`
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
  const myBlob = new Blob([gbkBuffer], { type: 'text/csv;charset=gbk;' });
  FileSaver.saveAs(myBlob, 设备.保存文件名);

}
