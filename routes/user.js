const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const { sqlGen } = require('../modules/mysql-conn');
const { alert } = require('../modules/util');


router.get('/join', (req, res, next) => {
	const pug = {title: '회원 가입', js: 'user-fr', css: 'user-fr'}
	res.render('user/join', pug);
});

router.get('/idchk/:userid', async(req, res, next) => {
	try {
		let rs = await sqlGen('users', 'S', {
			field: ['userid'],
			where: ['userid', req.params.userid]
		});
		// rs[0] => [] //데이터가없다면 이렇게 / rs[0]=> {userid: 'boraming'} //데이터가있다면 이렇게
		console.log(rs[0]);
		if(rs[0].length > 0) res.json({code: 200, isUsed: false}); //있으면 사용못한다
		else res.json({code: 200, isUsed: true});
	}
	catch(e) {
		res.json({ code: 500, error: e.sqlMessage || e }); //sql에러라면 그거 넣고 아니면 넘어온 거 넣고
	};
});

router.post('/save', async (req, res, next) => {
	console.log(process.env.BCRYPT_SALT, process.env.BCRYPT_ROUND);
	req.body.userpw = await bcrypt.hash(req.body.userpw + process.env.BCRYPT_SALT, Number(process.env.BCRYPT_ROUND));
	try {
		let rs = await sqlGen('users', 'I', {
			field: ['userid', 'userpw', 'username'],
			data: req.body
		});
		if(rs[0].affectedRows == 1) { //회원가입이 되었다면
			res.send(alert('회원 가입이 완료되었습니다. 로그인 해주세요.', '/user/login'));
		}
		else res.send(alert('회원 가입이 실패. 다시 시도.', '/user/join'));
	}
	catch(e) {
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/login', (req, res, next) => {
	const pug = {title: '회원 로그인', js: 'user-fr', css: 'user-fr'}
	res.render('user/login', pug);
});

router.post('/logon', async (req, res, next) => {
	try {
		let rs = await sqlGen ('users', 'S', {
			where: ['userid', req.body.userid]
		});
		if(rs[0].length > 0) {
			let compare = await bcrypt.compare(
				req.body.userpw + process.env.BCRYPT_SALT, rs[0][0].userpw);
			if(compare) { //일치한다면
				//세션 처리
				req.session.user = {
					userid: req.body.userid,
					username: req.body.username
				}
				res.send(alert('로그인 되었습니다.', '/board'));
			}
			else {
				res.send(alert('정보가 올바르지 않습니다', '/user/login'));
			}
		}
		else {
			res.send(alert('정보가 올바르지 않습니다', '/user/login'));
		}
	}
	catch(e) {
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/logout', (req, res, next) => {
	if(req.session) req.session.destroy(); //세션이 있다면 세션 지우기
	res.redirect('/board');
});

module.exports = router;