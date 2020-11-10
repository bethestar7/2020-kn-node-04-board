const multer = require('multer');
const moment = require('moment');
const path = require('path');
const fs = require('fs'); //fs => 노드에 있는 filesystem 모듈 /https://nodejs.org/api/fs.html 참고 (deprecated는곧없어질함수)
const fsp = require('fs/promises');
const { v4: uuidv4 } = require('uuid'); //유니크한 아이디 만듦. 난수 발생
const allowExt = ['.jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'ppt', 'pptx', 'pdf', 'hwp']; //허용하는 확장자 저장
const imgExt = ['.jpg', 'jpeg', 'png', 'gif']; //이미지 확장자 저장

//#1 콜백 사용. 이거 오류나서 안됨
/* const makeFolder = () => {
	const result = { err: null }; // let result = null; 해도 됨
	const folder = path.join(__dirname, '../uploads', moment().format('YYMMDD'));//roote의 uploads폴더에 저 형식이름으로 폴더만들어
	result.folder = folder; //result는 err와 folder라는 변수를 가지게 된다
	if(!fs.existsSync(folder)) {//fs.existsSync() Returns true if the path exists, false otherwise. / 폴더가 존재하지않으면
		//fs.mkdir(path[, options], callback) //make directory  폴더를 만들어라
		fs.mkdir(folder, { recursive: true }, (err) => { //folder만들고 끝나면 콜백 실행
			if(err) result.err = err; //에러가 존재한다면 result의 err에 에러를 채워줌. 그럼 null대신에 에러가 채워짐
			//if(err) result = err; 객체로 담은 거 아니면 이렇게 해도 됨
			return result; //result에 에러가 들어옴? //result = {err:null, folder: '경로'} or {err: err 들어오면 폴더생성실패}
		});
	}
	else return result; //폴더가 존재한다면 result 리턴 //result에 에러는 null이 그대로 / else를 안붙이면 위의 콜백이 무시된채 리턴이 된다
}; */

//#1 mkdirSync 사용
const makeFolder = () => {
	const result = { err: null }; // let result = null; 해도 됨
	const folder = path.join(__dirname, '../uploads', moment().format('YYMMDD'));//roote의 uploads폴더에 저 형식이름으로 폴더만들어
	result.folder = folder; //result는 err와 folder라는 변수를 가지게 된다
	if(!fs.existsSync(folder)) fs.mkdirSync(folder); //존재하는지 체크하고 충분히 시간 주고 폴더 만들기
	return result; 	
};

//#2 async await 사용
/* const makeFolder = async () => {
	let result = { err: null }; // let result = null; 해도 됨
	let folder = path.join(__dirname, '../uploads', moment().format('YYMMDD'));//roote의 uploads폴더에 저 형식이름으로 폴더만들어
	result.folder = folder; //result는 err와 folder라는 변수를 가지게 된다
	if(!fs.existsSync(folder)) {
		const err = await fsp.mkdir(folder) //error가 프로미스로 와서 아래 스토리지 도 어싱크 어웨이트로 해준다?
		if(err) result.err = err;
		return result;
	}
	else return result;
}; */


//아무나 업로드 하지 못하도록 하기 (파일 업로드는 보안이 제일 중요)
//https://www.npmjs.com/package/multer 참고
const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname).toLowerCase().replace(".", ""); //originalname받아서 다 소문자로 만들고 .을 공백으로 만듦 
	if(allowExt.indexOf(ext) > -1) { //찾았다면 허락 (alllowExt의 배열 중에 ext 가 있다면 0보다 클 테니까. 없으면 0이 나올테니까)
		req.allowUpload = {allow: true, ext};
		cb(null, true); 
	}
	else {
		req.allowUpload = {allow: false, ext}; //찾지못했다면 불허
		cb(null, false); 
	}
}

/* https://www.npmjs.com/package/multer > Diskstorage에서 긁어옴 */
const storage = multer.diskStorage({ //diskStorage 가 실행되면 콜백함수 두개를 실행해줘.
  destination: (req, file, cb) => { //file은 업로드를 통해 전달받은 파일
		const result = makeFolder();
		result.err ? cb(err) : cb(null, result.folder); //makeFoler실행하고 err의 결과값에 err가 있다면 err 넣고 아니면 에러 없고 폴더경로 넣고
  },
  filename: (req, file, cb) => {
		let ext = path.extname(file.originalname); //파일에 접근해서 오리지널네임 받고 / path.extname()는 ex)aa.jpg => .jpg만 추출
		let saveName = moment().format('YYMMDD') + '-' + uuidv4() + ext;
    cb(null, saveName); //우리가 넣은 cb로 diskStorage의 콜백을 실행함
  }
});
 
const upload = multer({ storage, fileFilter, limits: {fileSize: 2048000} }); //storage: storage 라고 써도 됨 /2mb정도로 제한


module.exports = { upload, allowExt, imgExt };