exports.PushStatus = Object.freeze({
    Ready: 0,
    Start: 1, // 시작, 예약
    Process: 2, // 진행
    Complete: 3, // 완료
    Expired: 4, // 기간 만료
    CANCELL: 5, // 취소
    NotFoundUser: 6, // 검색조건에 맞는 사용자가 없을경우
    Error: 9,
})


exports.PushSendType = Object.freeze({
    Reserve: 1, // 예약
    Direct: 2, // 즉시
})


exports.SendTarget = Object.freeze({
    ToAll: 1, // 모두에게
    ToTopic: 2, // 토픽으로
    ToFilter: 3, //필터 (osType , gender , locale , lang , swv , ageRange)
    ToIdList: 4, // 특정 사용자
})


exports.PushType = Object.freeze({
    INFO: 1, // 정보성 디폴트
    AD: 2, // 광고성
})


exports.MakeQueryKey = Object.freeze({
    all: 'all', // 모두에게
    osType: 'osType', // os타입
    appVersion: 'appVersion', //app버전
    locale: 'locale', // 지역
    email: 'email', //이메일
    gender: 'gender', // 성별
    ageRange: 'ageRange', // 연령대
    id_list: 'id_list', // 특정아이디
    lang: 'lang', //언어별
    swv: 'swv', // 소프트웨어 버전별
})


exports.PushFilterType = Object.freeze({
    LOCALE: 'locale',
    OSTYPE: 'osType',
    GENDER: 'gender',
    LANG: 'lang',
    SWV: 'swv',
    AGE_RANGE: 'ageRange',
    APP_VERSION: 'appVersion', //app버전
})

exports.PushTopic = ['game', 'event', 'notice', 'promo'] // 게임 , 이벤트 , 공지 , 프로모션