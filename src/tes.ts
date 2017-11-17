import { existsSync, writeFileSync, readFileSync, chmodSync, mkdirSync } from 'fs';

var a = 1;
console.log(typeof a);　
var b= '1';
console.log(typeof b);　
var c;
console.log(typeof c);　
var d= true;
console.log(typeof d);　
var e= [1,2,3];
console.log(typeof e);　
var f= function(){};
console.log(typeof f);
console.log(e instanceof Array)
console.log([1, 2, 3][4])
console.log(__dirname);
console.log(mkdirSync("/tmp/aabbcc"));