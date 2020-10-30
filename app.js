/** node_modules  ***************************************************/
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');


/** 내 modules  ***************************************************/
//module
const { pool } = require('./modules/mysql-conn');
//router들
const boardRouter = require('./routes/board');
const galleryRouter = require('./routes/gallery');


/** Initialize  ***************************************************/
app.listen(process.env.PORT, () => {
	console.log(`http://127.0.0.1:${process.env.PORT}`); 
}); //콜백함수는 반드시 안 써도 된다 /콜백함수 자리에 Server start라고 치기도.. 주소 치기 귀찮으니까 쓰는 듯 클릭해서 가게..


/** Initialize  ***************************************************/
app.set('view engine', 'pug'); //view 엔진은 퍼그로 지정
app.set('views', path.join(__dirname, './views'));  //views 폴더들 경로 지정 (절대 경로. 절대경로는 꼭 path.join으로)
app.locals.pretty = true; //클라이언트가 받는 html이 들여쓰기가 된다. 한줄아니고.


/** Middleware  ***************************************************/
app.use(express.json()); //받게 되는 모든 요청들을 json 파일로 바꿈
app.use(express.urlencoded({extended: false}));


/** Routers  ***************************************************/
app.use('/', express.static(path.join(__dirname, './public'))) //root로 들어올 경우 보낼 경로 지정 (절대 경로)
app.use('/board', boardRouter); // /board로 요청들어오면 boardRouter로 연결
app.use('/gallery', galleryRouter);
/* app.get('/err', (req, res, next) => {
	const err = new Error();
	next(err); //next에 err 객체를 넣으면 무조건 저 마지막 라우터로 간다
}); */


/** error 예외처리  ***************************************************/
app.use((req, res, next) => { // 경로를 적지 않은 건, 맞는 라우터를 찾지 못한 애들이 여기에 걸리도록 하는 것
	const err = new Error(); //에러객체 만들기
	err.code = 404; //만든 에러 객체에 코드 심기
	err.msg = '요청하신 페이지를 찾을 수 없습니다.';
	next(err); //에러 객체를 다음 라우터로 보낸다  / 모든 에러가 모일 맨 밑의 라우터(미들웨어)로 보내는 것
});

app.use((err, req, res, next) => { //에러를 모으는 맨 마지막 라우터는 인자가 총 네개이다. 위의 에러를 받을 error 인자
	console.log(err); //이거하면 오류코드를 터미널창에서 볼 수 있음
	const code = err.code || 500; //err.code가 있다면 걔를 넣고 아니면 500을 넣어라
	const msg = err.msg || '서버 내부 오류입니다. 관리자에게 문의하세요.';
	res.render('./error.pug', { code, msg });
});