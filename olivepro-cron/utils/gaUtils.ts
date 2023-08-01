
import {log} from "../winston/logger";

const {GaCountry , GaCountryReqParameterList} = require("../constants/ga")
// @ts-ignore
export const sumUsersByCountryAll = (v, rows) => {


    let countList = [];

    const {start, end} = v;

    for (let i = start; i <= end; i++) {
        let month = 0;
        // @ts-ignore
        countList.push(rows[i]["metricValues"][month]["value"]);

    }

    // @ts-ignore
    const sum = countList.map(v => parseInt(v)).reduce((v, i) => {

        return v + i

    }, 0);


    return String(sum);
}
// @ts-ignore
export const sumUsersByCountry = (response, rows) => {

    let count = 1;

    for (let i = 0; i <= 11; i++) {

        let number = 0;
        // @ts-ignore
        response[count] = rows[i]['metricValues'][number]['value'];

        // @ts-ignore
        log.info(`number : ${count}` + ` ========= > count :  ${response[count]}`)
        count++;
    }


    return response;
}

// @ts-ignore
export const setRedisKeyAndGaQueryObjectCountry = (country ,allRedisKey , koreaRedisKey , japanRedisKey , usRedisKey) =>{

    let redisKey;
    let gaQueryObjectCountry;

    switch (country){
        case 'kr' :
            redisKey = koreaRedisKey;
            gaQueryObjectCountry= GaCountry.SOUTH_KOREA;
            break;
        case 'jp' :
            redisKey = japanRedisKey;
            gaQueryObjectCountry= GaCountry.JAPAN;
            break;
        case 'us':
            redisKey = usRedisKey;
            gaQueryObjectCountry= GaCountry.UNITED_STATES;
            break;
        default :
            redisKey =allRedisKey;
            gaQueryObjectCountry= GaCountry.ALL;
    }

    return { redisKey , gaQueryObjectCountry }
}

// @ts-ignore
export const isExistsCountry = (country , res) =>{

    let boolean = true;

    if(!GaCountryReqParameterList.includes(country)) {
        res.status(400).json({
            msg: `${country} 존재 하지 않는 국가입니다.`,
            code: -1513,
            success: false
        })

        boolean = false;

        return boolean;
    }

    return boolean;

}