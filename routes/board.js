const express = require('express');
//const { createPool } = require('mysql2/promise');
const moment = require('moment');
const path = require('path');
const router = express.Router();
const { pool } = require('../modules/mysql-conn');
const { alert } = require('../modules/util');
const { upload, imgExt } = require('../modules/multer-conn');

router.get(['/', '/list'], async (req, res, next) => {
	//const pug = {title: '게시판 리스트', js: 'board', css:'board'};

	//내가 한 거 (db 화면에 뿌리기)
	//const connect = await pool.getConnection(); 
	//const result = await connect.query('SELECT * FROM board ORDER BY id DESC');
	//connect.release(); 
	//res.render('./board/list.pug', {title: '게시판 리스트', js:'board', css:'board', lists:result[0]}); 

	//res.render('./board/list.pug', pug);

	//선생님 답 (db 화면에 뿌리기)
	const pug = {title: '게시판 리스트', js: 'board', css:'board'};
	try {
		const sql = 'SELECT * FROM board ORDER BY id DESC';
		const connect = await pool.getConnection();
		const rs = await connect.query(sql); //물음표 없으면 VALUES는 안보내도 됨
		pug.lists = rs[0]; //pug의 lists라는 곳에 rs의 0번인덱스 내용(디비값이 여기있음)을 넣었음
		pug.lists.forEach((v) => { //moment 모듈로 날짜 가공하기! map()으로 해도 된다
			v.wdate = moment(v.wdate).format('YYYY년 MM월 DD일');
	});
		connect.release();
;		res.render('./board/list.pug', pug);
	}
	catch(e) {
		next(e);
	}
});

router.get(['/write'], (req, res, next) => {
	const pug = {title: '게시글 작성', js: 'board', css:'board'};
	res.render('./board/write.pug', pug);
});

router.post(['/save'],upload.single('upfile'), async (req, res, next) => {
	const { title, content, writer } = req.body; //write.pug에서 쓴 내용 받기 (구조분해할당으로)
	const values = [title, writer, content ];
	var sql = 'INSERT INTO board set title=?, writer=?, content=?';

	if(req.allowUpload) {//파일을 안올리면 allowUpload와 file 모두 생성 안되고, 허락안되는 파일이면 allowUpload만 생성됨. 허락되는 파일은 둘 다 생성
		if(req.allowUpload.allow) { //파일 올린 거 (allow가 true인 거)
			sql += ', savefile=?, realfile=?'; //filename이 저장된 파일 이름이고 originalname이 사용자가 올린 파일 이름
			values.push(req.file.filename);
			values.push(req.file.originalname);
		}
		else { //파일 안 올린 거 (allow가 false인 거)
			res.send(alert(`${req.allowUpload.ext}은(는) 업로드 할 수 없습니다.`, '/board'));
		}
	}

	try {
		const connect = await pool.getConnection(); //커넥션 객체 받기
		const rs = await connect.query(sql, values); //쿼리 결과 rs로 받기
		connect.release();
		//res.json(rs);
		res.redirect('/board');
	}
	catch(err) {
		next(err); //에러가 발생하면 만들어놓은 마지막 라우터로 보내기
	}
});

router.get('/view/:id', async (req, res) => {
	try {
		const pug = {title: '게시글 보기', js: 'board', css:'board'};
		const sql = "SELECT * FROM board WHERE id=?";
		const values = [req.params.id]; //시멘틱 주소는 params로 받는다
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		//res.json(rs); rs의 0번의 0번에 들어온다는 거 디버그로 확인
		connect.release();
		pug.list = rs[0][0];
		pug.list.wdate = moment(pug.list.wdate).format('YYYY-MM-DD HH:mm:ss');
		if(pug.list.savefile) { //첨부파일이 있다면
			var ext = path.extname(pug.list.savefile).toLowerCase().replace('.', ''); //확장자 가져옴
			if(imgExt.indexOf(ext) > -1) {
				pug.list.imgSrc = `/storage/${pug.list.savefile.substr(0, 6)}/${pug.list.savefile}`; //0번째부터 6개까지만 자름 => 폴더명 만듦 / 파일명붙임 => 이미지 경로 만든 것
			}
		}
		res.render('./board/view.pug', pug);
	}
	catch(e) {
		next(e);
	}
});

router.get('/delete/:id', async (req, res, next) => {
	try {
		const sql = "DELETE FROM board WHERE id=?";
		const values = [req.params.id];
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		res.send(alert('삭제되었습니다', '/board'));
	}
	catch(e) {
		next(e);
	}
});

router.get('/update/:id', async (req, res, next) => {
	try {
		const pug = {title: '게시글 수정', js: 'board', css:'board'};
		const sql = "SELECT * FROM board WHERE id=?";
		const values = [req.params.id]; //시멘틱 주소는 params로 받는다
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		connect.release();
		pug.list = rs[0][0];
		res.render('./board/write.pug', pug);
	}
	catch(e) {
		next(e);
	}
});

router.post('/saveUpdate', async (req, res, next) => {
	const { id, title, writer, content } = req.body; 
	try {
		const sql = "UPDATE board SET title=?, writer=?, content=? WHERE id=?"; //id가 일치하는 곳의 세 놈을 업뎃해라
		const values = [title, writer, content, id];
		const connect = await pool.getConnection(); //커넥션 객체 받기
		const rs = await connect.query(sql, values); //쿼리 결과 rs로 받기
		connect.release();
		if(rs[0].affectedRows == 1) res.send(alert('수정되었습니다.', '/board'));
		else res.send(alert('수정에 실패하였습니다.', '/board')); 
	}
	catch(e) {
		next(e); //에러가 발생하면 만들어놓은 마지막 라우터로 보내기
	}
});


module.exports = router;