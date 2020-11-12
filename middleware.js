/** node_modules  ***************************************************/
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const createError = require('http-errors');

app.listen(process.env.PORT, () => {
	console.log(`http://127.0.0.1:${process.env.PORT}`); 
}); 

//미들웨어 작성법
/* app.get('/', (req, res, next) => {
	console.log('FIRST');
	req.test = 'first';
	next();
}, (req, res, next) => {
	console.log('SECOND');
	req.test2 = 'second';
	next();
}, (req, res, next) => {
	console.log('THIRD');
	console.log(req.test);
	console.log(req.test2);
	res.send('<h1>hello</h1>');
}); */


//미들웨어 작성법
const first = (req, res, next) => {
	console.log('FIRST');
	next();
}
const third = (value) => {
	return (req, res, next) => {
		console.log(value);
		next();
	} 
}
app.get('/', isLogged, third('THIRD'), (req, res, next) => { //로그인되어있으면 통과. 미들웨어만 통과하면
	console.log('SECOND');
	res.send('<h1>hello</h1>');
})