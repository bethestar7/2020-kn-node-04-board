/* const mysql = require('mysql2/promise');
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DATABASE,
	port: process.env.DB_PORT,
	waitForConnections:true,
	connectionLimit: 10
});


//SQL 제너레이터
// mode = 'Insert, Update, Select, Delete'
// table = '테이블명'
// field = ['title', 'writer', 'content']
// data = {title: 'A', content:'B'} // req.body 로부터 데이터를 받아오므로(제이슨형태니까.자바스크립트객체로넘어오니까?)
// file = {filename: '201113-.jpg', originalname: 'abc.jpg', size: 1234} // req.file
// key = id값 (id값을 써야 인서트,업뎃,셀렉트등 할수있음)

const sqlGen = (table, obj) => { //정보를 받아서 sql과 values를 쏴 줌
	let { mode=null, field=[], data={}, file=null, id=null, sql=null, values=[], desc=null } = obj; //값없을수도있으니 null값 넣음
	let temp = Object.entries(data).filter(v => field.includes(v[0]));  //entries: object를 깨서 키,밸류 키,밸류를 배열로 넣는다
	 //includes는 indexOf의 ES6 버전이다 // field.indexOf(v[0]) > 1 과 같음

	switch(mode) {
		case 'I':
			sql = `INSERT INTO ${table} SET `;
			break;
		case 'U':
			sql = `UPDATE ${table} SET `;
			break;
		case 'D':
			sql = `DELETE FROM ${table} WHERE id=${id} `;
			break;
		case 'S':
			sql = `SELECT ${field.length == 0 ? '*' : field.toString()} FROM ${table} `; //toString => field를 , , , 해서 쫙 들어가게
			if(id) sql += `WHERE id=${id} `;
			if(desc) sql += `${desc} `;
			break;
	} 
	for(let v of temp) {
		sql += `${v[0]}=?,`; ////뒤에 더 연결될수도있으니까 , 넣었음
		values.push(v[1]);
	}

	if(file) {
		sql += `savefile=?, realfile=?, `; //뒤에 더 연결될수도있으니까 , 넣었음
		values.push(file.filename);
		values.push(file.originalname);
	}
	sql = sql.substr(0, sql.length - 1); //마지막 , 빼기
	
	if(mode == 'I', mode == 'U') sql += `WHERE id=${id}`;
	
	return { sql, values };
};



module.exports = { mysql, pool, sqlGen };
 */


const mysql = require('mysql2/promise');
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DATABASE,
	port: process.env.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10
});

const sqlGen = async (table, obj) => {
	let {mode=null, field=[], data={}, file=null, id=null, desc=null} = obj;
	let sql=null, values=[], connect=null, rs=null;
	let temp = Object.entries(data).filter(v => field.includes(v[0]));

	switch(mode) {
		case 'I':
			sql = `INSERT INTO ${table} SET `;
			break;
		case 'U':
			sql = `UPDATE ${table} SET `;
			break;
		case 'D':
			sql = `DELETE FROM ${table} WHERE id=${id} `;
			break;
		case 'S':
			sql = `SELECT ${field.length == 0 ? '*' : field.toString()} FROM ${table} `;
			if(id) sql += ` WHERE id=${id} `;
			if(desc) sql += ` ${desc} `;
			break;
	}

	for(let v of temp) {
		sql += `${v[0]}=?,`;
		values.push(v[1]);
	}

	if(file) {
		sql += `savefile=?,realfile=?,`;
		values.push(file.filename);
		values.push(file.originalname);
	}
	sql = sql.substr(0, sql.length - 1);
	if(mode == 'I', mode == 'U') sql += ` WHERE id=${id}`;
	connect = await pool.getConnection();
	rs = await connect.query(sql, values);
	connect.release();
	return rs;
}

module.exports = { mysql, pool, sqlGen };
