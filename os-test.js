const os = require('os'); //node가 가진 os 객체 가져오기

console.log(os.arch()); //arch()가 아키텍쳐이다 //x64 뜸. 아키텍처가 64비트라는 뜻
console.log(os.cpus()); //cpu 몇 갠지 볼 수 있음 / 학원컴터는 4개군..

console.log("END");