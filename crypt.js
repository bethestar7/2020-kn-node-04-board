// crypt  : 단방향 암호화 - 못 품
// cipher : 양방향 암복호화 - sha512는 아직 안 뚫림 / https (평문 전송 금지@)
// session: 서버가 가지는 전역 변수
// cookie : 클라이언트가 가지는 전역 변수
// CORS (Cross Origin Resource Share): 통신 규칙
// proxy - forward proxy
// proxy - reverse proxy


//crypt
const crypto = require('crypto'); //node가 가진 crypto 객체
const { createPoolCluster } = require('mysql2');
let password = 'abcd1234';
let salt = 'axcjk9234kASFC++1234||sdf'; //안뚫리게 추가
let hash = crypto.createHash('sha512').update(password+salt).digest('base64'); //암호화 sha512방식으로 암호화 표현방식은 base64
hash = crypto.createHash('sha512').update(hash).digest('base64'); //또돌리고
hash = crypto.createHash('sha512').update(hash).digest('base64'); //
hash = crypto.createHash('sha512').update(hash).digest('base64'); //암호화 총 4번 (salt값, 암호화 횟수도 비밀로)
console.log(hash); //터미널에 node crypt 치면 나옴


//cipher
let cipher = crypto.createCipher('aes-256-cbc', salt); //type, key?, iv(압축방법) // createCipher는 deprecated 고 createCipheriv 써야 함
let result = cipher.update('아버지를 아버지라...', 'utf-8', 'base64'); //암호화
result += cipher.final('base64');
console.log(result);

let decipher = crypto.createDecipher('aes-256-cbc', salt); //복호화
let result2 = decipher.update(result, 'base64', 'utf-8');
result2 += decipher.final('utf-8');
console.log(result2);