
function onDelete(id) {
	confirm('정말로 삭제하시겠습니까?') ? location.href='/board/delete/'+id : ""; //삭제할거면 로케이션가고 아니면 빈 값
}

function fileRemove(id) {
	if(confirm('첨부파일을 삭제하시겠습니까? 영구 삭제됩니다.')) {
		$.get('/board/fileRemove/'+id, function(r) {
			if(r.code == 200) {
				$(".file-wrap").remove();
				alert('첨부파일이 삭제되었습니다.');
			}
			else {
				console.log(r.err);
				alert('삭제 실패하였습니다. 관리자에게 문의하세요.');
			}		
		});
	}
}