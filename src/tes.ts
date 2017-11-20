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
// console.log(mkdirSync("/tmp/aabbcc"));

console.log(/^\S+\s+([0-9]+)/.exec("root       802  0.0  0.1  63756 13148 ?        S    17:59   0:00 /usr/bin/python /usr/local/bin/qqbot -dm -b /tmp/qqbot_15000 -p 15000 -hp 15001"));

