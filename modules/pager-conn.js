// let pagers = pager(2, 90, {listCnt: 5, pagerCnt: 6}) //listCnt=> 한화면에 보일?
// let pagers = pager(2, 90) => 얘는 꼭 보내야될 것

const pager = (page, totalRecord, obj) => {
	page = Number(page); //문자로 들어올수도있으니 숫자로 넣어준다
	totalRecord = Number(totalRecord);
	let { listCnt=5, pagerCnt=3 } = obj || {}; //obj가 undefined(false)라면 빈 객체 넣어줌. 기본값이 들어갈 것임? 생성자 오버로드 잡은 것
	let totalPage =  Math.ceil(totalRecord / listCnt);
	let startIdx = (page - 1) * listCnt;
	let startPage = Math.floor((page - 1) / pagerCnt) * pagerCnt + 1;
	let endPage = startPage + pagerCnt - 1 > totalPage ? totalPage : startPage + pagerCnt - 1;
	let nextPage = page + 1 > totalPage ? 0 : page + 1; //0이면 disabled 되게 할 것 (버튼 안 보이게)
	let prevPage = page - 1;
	return { page, totalRecord, listCnt, pagerCnt, totalPage, startIdx, startPage, endPage, nextPage, prevPage };
};

module.exports = pager;