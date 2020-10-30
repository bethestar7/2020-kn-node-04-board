const express = require('express');
const { createPool } = require('mysql2/promise');
const router = express.Router();
const { pool } = require('../modules/mysql-conn');

router.get(['/', '/list'], (req, res, next) => {
	const pug = {title: '게시판 리스트', js: 'board', css:'board'};
	res.render('./board/list.pug', pug);
});

router.get(['/write'], (req, res, next) => {
	const pug = {title: '게시글 작성', js: 'board', css:'board'};
	res.render('./board/write.pug', pug);
});

router.post(['/save'], async (req, res, next) => {
	const { title, content, writer } = req.body; //write.pug에서 쓴 내용 받기
	var values = [title, content, writer];
	var sql = 'INSERT INTO board set title=?, writer=?, content=?';
	try {
		const connect = await pool.getConnection(); //커넥션 객체 받기
		const rs = await connect.query(sql, values); //쿼리 결과 rs로 받기
		connect.release();
		res.json(rs);
	}
	catch(err) {
		next(err); //에러가 발생하면 만들어놓은 마지막 라우터로 보내기
	}
});


module.exports = router;