# OliveUnion Push, Cron Service

This is a Notification service build with [nodejs](https://nodejs.org/en/), it uses [express](https://expressjs.com/), [mongoose](https://mongoosejs.com/) or mysql and [firebase-admin sdk](https://firebase.google.com/docs/admin/setup) to send notifications. It let you 
1. subscribe a user to the notifications, subscribe a user to a certain topic. 
2. send notification to all the subscribed users, to a specific user or users, to a group of users with a common topic. 
3. send sms to all the subscribed users, to a specific user or users. (you have to integrate with an sms provider)
4. refresh a certain user's firebase token.

## Instructions

To Run the Project:
* clone the repo or download it
* cd into the directory of the project from the terminal
* head to the [Firebase console](https://console.firebase.google.com/u/0/)
* create a new project from the firebase console and give it a name, or select an existing project.
* go to your project's settings, then to service accounts, then generate new private key and download it.
* copy the content of the private key file you just downloaded into `serviceAccountKey.json`
* configure your mongo database in `mongoose.js` in my case i use a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), and it's password will be in `nodemon.json.example` then rename it to `nodemon.json`
* install all project dependencies with `npm install`
* run the project with `npm start` and it will be listening at localhost:3000
* test the project with `npm test`

***To Run the Service with Docker:***
* make sure that docker and docker-compose are installed.
* run `sudo docker-compose up` it will be listening at localhost:3000

The API contains 8 endpoints 
**You can see a full Documentation for the API and examples from [here](https://documenter.getpostman.com/view/3845720/S1Lwy7kT)**

  1. /api/v1/subscribe
     * /
     * /:topic
  2. /api/v1/push
     * /
     * /push/toAll
     * /push/toGroup
  3. /api/v1/sms
     * /
     * /toAll
  4. /api/v1/refreshToken
     * /
  5. /api/v1/tutorial (CRUD)
     * /
     * /published
     * /:id

  6. Email
  7. SNS > Send SMS 


### vonage verfiy template

  /verify-tem.js 에 새 템플릿을 등록하기 위한 코드가 있습니다.
  (request to vonage server)

  /templ-chk.js 
  vonage api 키에 관련덴 템플릿을 체크하기 위한 코드가 있습니다.


## /utils
 미들웨어와 컨트롤러에서 사용되는 함수가 있습니니다.
  /utils/authchecker : http 리퀘스트 헤더의 authorization 안의 토큰 값을 확인해 리퀘스트의 유효성을 확인합니다.
  /utils/authcheckerRes : authchecker에서 쓰이는 리스폰스가 정의되어 있습니다. 
  /mysql 환경 변수에서 mysql 관련 설정을 가져와 dbpool을 만듭니다.
  /redis redis 클라이언트를 내보냅니다.
  /verifyCnt, /verifyUtils: sms verify에서 기능하는 함수들입니다.

## /winston
  로깅을 한 모듈입니다.
  import { log } from './winston/logger'
  log.info('string') log.warn('string') logger.err('string') log.http('string') log.debug('string')

## /video-chat,  /video-chat-open
  라우트와 컨트롤러로 나누어져 있습니다. 
  라우터 단계에서 authcheck를 불러와 요청을 검증합니다. 
  video-chat-open은 확인하지 않습니다.(vonage sdk 사용 후 해당 엔드포이트로 오는 콜백을 db에 기록합니다.)

## /verify-code
  기본적으로 verfiy-code 들은 같은 로직으로 동작하고 있습니다. 
  vonage 쪽의 sdk를 사용해 요청을 보내고 확인합니다. 
  전송 전의 확인 과정이 다른 코드들이 나누어져 있습니다.
  시도 횟수는 redis 로 기록합니다.

  