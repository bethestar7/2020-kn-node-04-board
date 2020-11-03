function onDelete(id) {
	confirm('정말로 삭제하시겠습니까?') ? location.href='/board/delete/'+id : ""; //삭제할거면 로케이션가고 아니면 빈 값
}