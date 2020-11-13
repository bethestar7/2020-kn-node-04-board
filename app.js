/** node_modules  ***************************************************/
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const createError = require('http-errors');
const { upload } = require('./modules/multer-conn');
//const multer = require('multer');
//const upload = multer({ dest: path.join(__dirname, './uploads/') });  //멀터에게 속성을 줌. 저장되는 폴더를 uploads로
//const { v4: uuidv4 } = require('uuid'); //v4라는 변수에 uuidv4를 기본값으로 넣으라는 얘기
//var uid = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed' // 그 uuid4를 가져다 씀 > 난수 발생함. 유니크한 아이디


/** 내 modules  ***************************************************/
//module
//const { pool } = require('./modules/mysql-conn');
const logger = require('./modules/morgan-conn');
//router들
const boardRouter = require('./routes/board');
const galleryRouter = require('./routes/gallery');


/** Initialize  ***************************************************/
app.listen(process.env.PORT, () => {
	console.log(`http://127.0.0.1:${process.env.PORT}`); 
}); //콜백함수는 반드시 안 써도 된다 /콜백함수 자리에 Server start라고 치기도.. 주소 치기 귀찮으니까 쓰는 듯 클릭해서 가게..
		//시간차가 있음. 콜백함수는 .그래서 비동기다?


/** Initialize  ***************************************************/
app.set('view engine', 'pug'); //view 엔진은 퍼그로 지정
app.set('views', path.join(__dirname, './views'));  //views 폴더들 경로 지정 (절대 경로. 절대경로는 꼭 path.join으로)
app.locals.pretty = true; //클라이언트가 받는 html이 들여쓰기가 된다. 한줄아니고.


/** Middleware  ***************************************************/
//app.use(logger, express.json(), express.urlencoded({extended: false})); //함수를 만들때 인자가 req, res, next가 있으면 이게 미들웨어이다
//미들웨어를 쉼표로 계속 연결할 수 있다!
app.use(logger);
//app.use((req, res, next) => { }) => 이게 미들 웨어이다
//app.use(express.json()); //받게 되는 모든 요청들을 json 파일로 바꿈
app.use((req, res, next) => { //이런 식으로 쓸 수도 있음. express 객체에 여러 개를 거쳐서 실행하게 하고프면?
	express.test = "aaa"
	express.json()(req, res, next) //iife 즉시 실행함수?
})
app.use(express.urlencoded({extended: false}));


/** Routers (라우터가 있는 미들웨어. 있으면 걸리고 아니면 다음 다음) ***************************************************/
app.use('/', express.static(path.join(__dirname, './public'))) //root로 들어올 경우 보낼 경로 지정 (절대 경로)
app.use('/storage', express.static(path.join(__dirname, './uploads')))
app.use('/board', boardRouter); // /board로 요청들어오면 boardRouter로 연결
app.use('/gallery', galleryRouter);
/* app.get('/err', (req, res, next) => {
	const err = new Error();
	next(err); //next에 err 객체를 넣으면 무조건 저 마지막 라우터로 간다
}); */

app.get('/test/upload', (req, res, next) => {
	res.render('test/upload');
});
//#1
app.post('/test/save', upload.single('upfile'), (req, res, next) => {//upload.single('upfile')이라는 미들웨어를 중간에 거쳐서 끝나고 가게 함
//upload.single('upfile')미들웨어가 난수로 uploads폴더에 파일을 저장한다. 고로 API를 써서 입맛에 맞게 저장할 수 있다(유니크한 아이디)
	//const { title, upfile } = req.body;
	//res.redirect('/board');
	//res.json(req.body);
	res.json(req.file); //multer가 req 객체에 file을 만들어서 거기에 파일 정보 넣어줌?
	//req.file; //uplode 미들웨어를 지났으니까 req.file 가져올 수 있음
	//req.allowUpload;
	//res.json(req.allowUpload);
});
//#2. 이렇게 쓸 수도 있다는 것 (미들웨어)
/* app.post('/test/save', (req, res, next) => {
	upload.single('upfile')(req, res, next);
	res.json(req.allowUpload);
}); */


/** error 예외처리  ***************************************************/
/* app.use((req, res, next) => { // 경로를 적지 않은 건, 맞는 라우터를 찾지 못한 애들이 여기에 걸리도록 하는 것
	const err = new Error(); //에러객체 만들기
	err.code = 404; //만든 에러 객체에 코드 심기
	err.msg = '요청하신 페이지를 찾을 수 없습니다.';
	next(err); //에러 객체를 다음 라우터로 보낸다  / 모든 에러가 모일 맨 밑의 라우터(미들웨어)로 보내는 것
}); */

/* app.use((err, req, res, next) => { //에러를 모으는 맨 마지막 라우터는 인자가 총 네개이다. 위의 에러를 받을 error 인자
	console.log(err); //이거하면 오류코드를 터미널창에서 볼 수 있음
	const code = err.code || 500; //err.code가 있다면 걔를 넣고 아니면 500을 넣어라
	const msg = err.msg || '서버 내부 오류입니다. 관리자에게 문의하세요.';
	res.render('./error.pug', { code, msg });
}); */

app.use((req, res, next) => {
	next(createError(404, '요청하신 페이지를 찾을 수 없습니다.'));
});

app.use((err, req, res, next) => {
	let code = err.status || 500;
	let message = err.status == 404 ? 
	'페이지를 찾을수 없습니다.' : '서버 내부 오류입니다. 관리자에게 문의하세요.'
	let msg = process.env.SERVICE == 'production' ? message : err.message;
	res.render('./error.pug', { code, msg });
});