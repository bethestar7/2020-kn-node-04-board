const path = require('path');

const alert = (msg, loc=null) => {
	var html = `<script>alert('${msg}');`;	
	if(loc) html += `location.href='${loc}'`;//loc가 존재한다면
	html += `</script>`;
	return html;
}

const uploadFolder = (filename) => {
	return path.join(__dirname, '../uploads', filename.substr(0, 6), filename);
}

const imgFolder = (filename) => {
	return path.join('/storage', filename.substr(0, 6), filename); //upload폴더를 모르게 storage로 경로 변경 /storage로 클라이언트가 접근하면 uploads폴더로 접근하게끔
}

const extGen = (filename, mode='L') => {
	let ext = path.extname(filename).replace(".", "");
	return mode == 'U' ? ext.toUpperCase() : ext.toLowerCase(); 
}


module.exports = { alert, uploadFolder, imgFolder, extGen };