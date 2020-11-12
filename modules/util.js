const path = require('path');

const alert = (msg, loc=null) => {
	var html = `<script>alert('${msg}');`;	
	if(loc) html += `location.href='${loc}'`;//loc가 존재한다면
	html += `</script>`;
	return html;
}

const uploadFolder = (filename) => { //내가 전달받은 filename
	return path.join(__dirname, '../uploads', filename.substr(0,6), filename);
}

module.exports = { alert, uploadFolder };