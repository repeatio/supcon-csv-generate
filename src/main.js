import "./style.css";
// import {print} from "./component";
// import {make1file} from "./make1file";
import { makeFiles } from "./makeFiles";

var $ = require("jquery");
var XLSX = require("xlsx");

const 判断设备类型 = (位号) =>
  位号.substring(0, 2) === "XV" ? "气动切断阀" : "other";

$("button").on("click", (e) => {
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
          类型: 判断设备类型(位号),
        };
      });
    }).flatMap((arr) => arr);

    makeFiles(arr);

    // data preview
    var output = document.getElementById("result");
    output.innerHTML = JSON.stringify(arr, null, 2);
  };
  FR.readAsArrayBuffer(file);
});
