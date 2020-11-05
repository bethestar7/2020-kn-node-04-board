const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');

const logStream = rfs.createStream('access.log', {  //rfs가 가진 createStream메서드 사용 / 파일명이 access.log /이 파일에 저장 
	interval: '1d', //interval을 하루 기준 / 쌓이는 로그를 하루 단위로 갱신
	path: path.join(__dirname, '../logs') //logs라는 폴더에 access.log파일이 존재. 여기에 로그를 남길 것임
});

const logger = morgan('combined', {stream: logStream}); //combine 모드 / stream 방식은 logStream으로 쓰겠다

module.exports = logger; //이건 미들웨어이다. 앱이 이 모듈을 불러