const express = require('express');
const moment = require('moment');
const path = require('path');
const fs = require('fs-extra');
const createError = require('http-errors');
const router = express.Router();
const { pool, sqlGen } = require('../modules/mysql-conn');
const { alert, uploadFolder, imgFolder, extGen } = require('../modules/util');
const { upload, imgExt } = require('../modules/multer-conn');
const pager = require('../modules/pager-conn');

router.get(['/', '/list', '/list/:page'], async (req, res, next) => {
	let page = req.params.page || 1; //params에 페이지 번호가 있으면 그거 넣고 아니면 1넣기
	let connect, rs, pug;
	try {
		rs = await sqlGen('board', {mode: 'S', field: ['count(id)']});
		let pagers = pager(page, rs[0][0]['count(id)'], {pagerCnt: 5, listCnt: 7});
		pug = {title: '게시판 리스트', js: 'board', css: 'board', ...pagers}; //...pagers는 펼침연산자
		rs = await sqlGen('board', { 
			mode: 'S', 
			desc: `ORDER BY id DESC LIMIT ${pagers.startIdx}, ${pagers.listCnt}` 
		});
		pug.lists = rs[0];
		pug.lists.forEach((v) => {
			v.wdate = moment(v.wdate).format('YYYY년 MM월 DD일');
		});
		res.render('./board/list.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/write', (req, res, next) => {
	const pug = {title: '게시글 작성', js: 'board', css: 'board'};
	res.render('./board/write.pug', pug);
});

router.post('/save', upload.single('upfile'), async (req, res, next) => {
	let connect, rs;
	try {
		if(req.allow === false) res.send(alert(`${req.ext}은(는) 업로드 할 수 없습니다.`, '/board'));
		else {
			rs = await sqlGen('board', {
				mode: 'I', 
				field: ['title', 'writer', 'content'], 
				data: req.body,
				file: req.file
			});
		/* 	connect = await pool.getConnection();
			rs = await connect.query(temp.sql, temp.values);
			connect.release(); */
			res.redirect('/board');
		}
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/view/:id', async (req, res) => {
	let connect, rs, pug;
	try {
		pug = {title: '게시글 보기', js: 'board', css: 'board'};
		rs = await sqlGen('board', {mode: 'S', id: req.params.id});
		/* connect = await pool.getConnection();
		rs = await connect.query(temp.sql);
		connect.release(); */
		pug.list = rs[0][0];
		pug.list.wdate = moment(pug.list.wdate).format('YYYY-MM-DD HH:mm:ss');
		if(pug.list.savefile) {
			if(imgExt.includes(extGen(pug.list.savefile))) {
				pug.list.imgSrc = imgFolder(pug.list.savefile);
			}
		}
		res.render('./board/view.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/delete/:id', async (req, res, next) => {
	let connect, rs;
	try {
		/* connect = await pool.getConnection(); */
		rs = await sqlGen('board', {mode: 'S', id: req.params.id, field: ['savefile']});
		/* rs = await connect.query(temp.sql); */
		if(rs[0][0].savefile) await fs.remove(uploadFolder(rs[0][0].savefile));
		rs = await sqlGen('board', {mode: 'D', id: req.params.id});
		/* rs = await connect.query(temp.sql); */
		/* connect.release(); */
		res.send(alert('삭제되었습니다', '/board'));
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/update/:id', async (req, res, next) => {
	let connect, rs, pug;
	try {
		pug = {title: '게시글 수정', js: 'board', css: 'board'};
		rs = await sqlGen('board', {mode: 'S', id: req.params.id});
		/* connect = await pool.getConnection();
		rs = await connect.query(temp.sql);
		connect.release(); */
		pug.list = rs[0][0];
		res.render('./board/write.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.post('/saveUpdate', upload.single('upfile'), async (req, res, next) => {
	let connect, rs;
	try {
		if(req.allow === false) res.send(alert(`${req.ext}은(는) 업로드 할 수 없습니다.`, '/board')); //
			//undefiend=>첨부파일안건드린거(첨부파일없는거) => 이걸 걸러내기 위해서 정확히 allow false인 것만 딱 잡아서 해주는 것
		else {
			/* connect = await pool.getConnection(); */
			if(req.file) {
				rs = await sqlGen('board', {mode: 'S', id: req.body.id, field: ['savefile']});
				/* rs = await connect.query(temp.sql); */
				if(rs[0][0].savefile) await fs.remove(uploadFolder(rs[0][0].savefile));
			}
			rs = await sqlGen('board', {
				mode: 'U', 
				id: req.body.id, 
				field: ['title', 'writer', 'content'],
				data: req.body,
				file: req.file
			});
			/* rs = await connect.query(temp.sql, temp.values);
			connect.release(); */
			res.send(alert('수정되었습니다', '/board'));
		}
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/download', (req, res, next) => {
	let { file: saveFile, name: realFile } = req.query;
	res.download(uploadFolder(saveFile), realFile);
});

//x버튼 눌렀을때 ajax 통신해서 지우는 부분임
router.get('/fileRemove/:id', async (req, res, next) => {
	let connect, rs;
	try {
		/* connect = await pool.getConnection(); */
		rs = await sqlGen('board', {mode: 'S', id: req.params.id, field: ['savefile']});
		/* rs = await connect.query(temp.sql, ); */
		if(rs[0][0].savefile) await fs.remove(uploadFolder(rs[0][0].savefile));
		rs = await sqlGen('board', {
			mode: 'U',
			id: req.params.id,
			field: ['realfile', 'savefile'],
			data: {realfile: null, savefile: null}
		});
		/* rs = await connect.query(temp.sql, temp.values);
		connect.release(); */
		res.json({code: 200});
	}
	catch(e) {
		if(connect) connect.release();
		res.json({code: 500, err: e});
	}
});

module.exports = router;