import "./style.css";
// import {print} from "./component";
// import {make1file} from "./make1file";
import { makeFiles } from "./makeFiles";

var $ = require("jquery");
var XLSX = require("xlsx");

const 判断设备类型 = (位号, 描述) => {
  const typeStr = 位号.substr(0, 2);
  switch (typeStr) {
    case "XV":
      return "气动切断阀";
    case "MO":
      if (描述.includes("搅拌")) {
        return "变频电机";
      } else if (描述.includes("泵")) {
        return "定频电机";
      } else {
        throw "Unknow Motor Type";
      }
    default:
      return "other";
  }
};

var result;

const downloadText = (str, filename) => {
  var eleLink = document.createElement("a");
  eleLink.download = filename ? filename : `${Date.now()}.txt`;
  eleLink.style.display = "none";
  // 下载内容转变成blob地址
  eleLink.href = URL.createObjectURL(new Blob([str]));
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
};

$("#example").on("click", (e) => {
  const example = [
    {
      位号: "XV250139",
      描述: "硫酸铵13#升温",
      流程图: "硫酸铵浓缩2",
      类型: "气动切断阀",
    },
    {
      位号: "XV250138",
      描述: "硫酸铵12#升温",
      流程图: "硫酸铵浓缩2",
      类型: "气动切断阀",
    },
  ];
  makeFiles(example);
});

$("#input").on("change", function (e) {
  result = null;
  $("#result").empty();
  var file = e.target.files[0];
  console.log(file);
  // input canceled, return
  if (!file) return;

  var FR = new FileReader();
  FR.onload = function (e) {
    const data = e.target.result;

    const { SheetNames, Sheets } = XLSX.read(data, { type: "array" });

    console.log(SheetNames, Sheets);

    const arr = SheetNames.map((sheetName) => {
      const arrDevices = XLSX.utils.sheet_to_json(Sheets[sheetName]);
      return arrDevices.map((device) => {
        const { 位号, 描述 } = device;

        return {
          位号,
          描述,
          流程图: sheetName,
          类型: 判断设备类型(位号, 描述),
        };
      });
    }).flatMap((arr) => arr);

    result = arr;

    $("button").show();
  };
  FR.readAsArrayBuffer(file);
});

$("#downloadCSV").on("click", (e) => {
  var output = document.getElementById("result");
  output.innerHTML = JSON.stringify(result, null, 2);

  var files = result
    .filter((device) => device.类型 == "气动切断阀")
    .map((valve) => {
      const { 位号, 描述, 流程图 } = valve;
      return {
        名称: `205_038_${流程图}_${位号}`,
        描述: `${描述}`,
        关联: "<ROOT>\\Object\\205_038_气动阀.dsg",
        数据个数: "3",
        文件名: `205_038_${流程图}_${位号}`,
        位号: `${位号}`,
        保存文件名: `205_038_${流程图}_${位号}.csv`,
      };
    })
    .map((valve) => {
      const { 名称, 描述, 关联, 数据个数, 文件名, 位号, 保存文件名 } = valve;
      const csvContent = `版本号,260
名称,${名称}
描述,${描述}
关联,${关联}
数据个数,${数据个数}
[CSV],	,	${文件名},	,	,	,	
[气动切断阀],	,	${位号},	,	,	,	
[设备描述],	,	${描述},	,	,	,	`;
      return {
        contentStr: csvContent,
        fileName: 保存文件名,
      };
    });

  makeFiles(files);
});
$("#motorCSV").on("click", (e) => {
  var output = document.getElementById("result");
  output.innerHTML = JSON.stringify(result, null, 2);
  var files = result
    .filter((device) => device.类型.includes("电机"))
    .map((valve) => {
      const { 位号, 描述, 流程图 } = valve;
      return {
        名称: `205_038_${流程图}_${位号}`,
        描述: `${描述}`,
        关联: "<ROOT>\\Object\\205_038_电机.dsg",
        数据个数: "3",
        文件名: `205_038_${流程图}_${位号}`,
        位号: `${位号}`,
        保存文件名: `205_038_${流程图}_${位号}.csv`,
      };
    })
    .map((valve) => {
      const { 名称, 描述, 关联, 数据个数, 文件名, 位号, 保存文件名 } = valve;
      const csvContent = `版本号,260
名称,${名称}
描述,${描述}
关联,${关联}
数据个数,${数据个数}
[CSV],	,	${文件名},	,	,	,	
[电机],	,	${位号},	,	,	,	
[设备描述],	,	${描述},	,	,	,	`;
      return {
        contentStr: csvContent,
        fileName: 保存文件名,
      };
    });

  makeFiles(files, "motor_csv.zip");
});

$("#tCodeValve").on("click", (e) => {
  const valveTextcode = (devices) =>
    devices
      .filter((device) => device.类型 === "气动切断阀")
      .map((valve) => {
        const { 位号 } = valve;
        return `${位号}_Fb = getValveFeedback(${位号}_K , ${位号}_G);`;
      })
      .join("\r\n");

  const textcode = valveTextcode(result);
  var output = document.getElementById("result");
  output.innerHTML = textcode;
  downloadText(textcode);
});

$("#tCodeMotor").on("click", (e) => {
  const gen = (devices) =>
    devices
      .filter((device) => device.类型.includes("电机"))
      .map((motor) => {
        const { 位号, 流程图, 描述 } = motor;
        return [`${流程图}_${描述}`, `${位号}_Q`, `${位号}_T`];
      })
      .flat()
      .map((param) => {
        switch (param.slice(-2)) {
          case "_Q":
          case "_T":
            return `TP(${param}, 2000, ${param}, TEMP);`;
          default:
            return `(***${param}***)`;
        }
      })
      .join("\r\n");

  const textcode = gen(result);
  var output = document.getElementById("result");
  output.innerHTML = textcode;
  downloadText(textcode);
});

$("#tCodeVarFreqMotorFb").on("click", (e) => {
  const gen = (devices) =>
    devices
      .filter((device) => device.类型 === "变频电机")
      .map((motor) => {
        const { 位号, 流程图, 描述 } = motor;
        return `(***${流程图}_${描述}_运行状态反馈***)\r\n${位号}_Fb = getMotorFeedback(${位号}_I);`;
      })
      .join("\r\n");

  const textcode = gen(result);
  var output = document.getElementById("result");
  output.innerHTML = textcode;
  downloadText(textcode);
});

$("#tCodeFixedFreqMotorFb").on("click", (e) => {
  const gen = (devices) =>
    devices
      .filter((device) => device.类型 === "定频电机")
      .map((motor) => {
        const { 位号, 流程图, 描述 } = motor;
        return `(***${流程图}_${描述}_运行状态反馈***)\r\n${位号}_Fb = ${位号}_Z;`;
      })
      .join("\r\n");

  const textcode = gen(result);
  var output = document.getElementById("result");
  output.innerHTML = textcode;
  downloadText(textcode);
});

$("#varForValve").on("click", (e) => {
  const valveTextcode = (devices) =>
    devices
      .filter((device) => device.类型 === "气动切断阀")
      .map((valve) => {
        const { 位号 } = valve;
        return `${位号}_Fb`;
      })
      .join(",\r\n");

  const textcode = valveTextcode(result);
  var output = document.getElementById("result");
  output.innerHTML = textcode;
  downloadText(textcode, "自定义变量_阀门反馈.csv");
});
$("#varForMotor").on("click", (e) => {
  const valveTextcode = (devices) =>
    devices
      .filter((device) => device.类型.includes("电机"))
      .map((valve) => {
        const { 位号, 类型 } = valve;
        return `${位号}_Fb, ${类型}`;
      })
      .join(",\r\n");

  const textcode = valveTextcode(result);
  var output = document.getElementById("result");
  output.innerHTML = textcode;
  downloadText(textcode, "自定义变量_电机反馈.csv");
});
$("#checkTableOfValve").on("click", (e) => {
  const valveTextcode = (devices) =>
    devices
      .filter((device) => device.类型 === "气动切断阀")
      .map((valve) => {
        const { 位号, 描述, 流程图 } = valve;
        return `${位号},${描述}, ${流程图}`;
      })
      .join(",\r\n");

  const textcode = valveTextcode(result);
  var output = document.getElementById("result");
  output.innerHTML = textcode;
  downloadText(textcode, "阀门验收表格.csv");
});
