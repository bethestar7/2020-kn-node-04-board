const alert = (msg, loc=null) => {
	var html = `<script>alert('${msg}');`;	
	if(loc) html += `location.href='${loc}'`;//loc가 존재한다면
	html += `</script>`;
	return html;
}

module.exports = { alert };