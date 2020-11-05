const multer = require('multer');
const moment = require('moment');
const path = require('path');
const fs = require('fs'); //fs => 노드에 있는 filesystem 모듈 /https://nodejs.org/api/fs.html 참고 (deprecated는곧없어질함수)
const { v4: uuidv4 } = require('uuid');

const makeFolder = () => {
	let result = { err: null }; // let result = null; 해도 됨
	let folder = path.join(__dirname, '../uploads', moment().format('YYMMDD'));//roote의 uploads폴더에 저 형식이름으로 폴더만들어
	result.folder = folder; //result는 err와 folder라는 변수를 가지게 된다
	if(!fs.existsSync(folder)) {//fs.existsSync() Returns true if the path exists, false otherwise. / 폴더가 존재하지않으면
		//fs.mkdir(path[, options], callback) //make directory  폴더를 만들어라
		fs.mkdir(folder, (err) => { //folder만들고 끝나면 콜백 실행
			if(err) result.err = err; //에러가 존재한다면 result의 err에 에러를 채워줌. 그럼 null대신에 에러가 채워짐
			//if(err) result = err; 객체로 담은 거 아니면 이렇게 해도 됨
			return result; //result에 에러가 들어옴?
		})
	}
	else return result; //폴더가 존재한다면 result 리턴 //result에 에러는 null이 그대로
};

/* https://www.npmjs.com/package/multer > Diskstorage에서 긁어옴 */
var storage = multer.diskStorage({ //diskStorage 가 실행되면 콜백함수 두개를 실행해줘.
  destination: function (req, file, cb) {
		const result = makeFolder();
		result.err ? cb(err) : cb(null, result.folder); //makeFoler실행하고 err의 결과값에 err가 있다면 err 넣고 아니면 에러 없고 폴더경로 넣고?
  },
  filename: function (req, file, cb) {
		let ext = path.extname(file.originalname); //파일에 접근해서 오리지널네임 받고 / path.extname()는 ex)aa.jpg => .jpg만 추출
		let saveName = moment().format('YYMMDD') + '-' + uuidv4() + ext;
    cb(null, saveName); //우리가 넣은 cb로 diskStorage의  콜백을 실행함
  }
});
 
const upload = multer({ storage: storage });


module.exports = { upload };