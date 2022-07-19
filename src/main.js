import "./style.css";
import {print} from "./component";
import {make1file} from "./make1file";
console.log("webpack is so easy.");
print();
make1file();

var iconv = require('iconv-lite');
const Buffer = require('buffer/').Buffer;

// Convert from an encoded buffer to a js string.
var str = iconv.decode(Buffer.from([0xd0, 0xf2, 0xba, 0xc5, 0x2c]), 'gbk');
console.log(str);


// Convert from a js string to an encoded buffer.
var buf = iconv.encode(str, 'gbk');
console.log(buf);
