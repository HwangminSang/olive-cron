import {activeUserAgeRange} from "../api/controllers/ga";

const propertyId = '275044301';

export const countryTotalQuery = {
  property: `properties/${propertyId}`,
  dateRanges: [
    {
      "startDate": "2021-06-01",
      "endDate": "yesterday"
    },
  ],
  dimensions: [
    {
      name: 'countryId',
    },
  ],
  metrics: [
    {
      name: 'totalUsers',
    },
  ],
}

export const totalUsersQuery = {
  property: `properties/${propertyId}`,
  dateRanges: [
    {
      "startDate": "2021-06-01",
      "endDate": "yesterday"
    },
  ],
  metrics: [
    {
      name: 'totalUsers',
    },
  ],
}

// 2021 -06 - 01 ~ 어제
export const genderCount = {
  property: `properties/${propertyId}`,
  dateRanges:[
    {
      "startDate":"2021-06-01",
      "endDate":"yesterday"
    }
  ],
  metrics:[
    {
      name:"activeUsers"
    }
  ],
  dimensions:[
    {
      name :"userGender"
    }
  ]
}




export const activeUserPerDayQuery: any = {
  property: `properties/${propertyId}`,
  dimensions: [{ name: "date" }],
  metrics: [{ name: "activeUsers" }],
  dateRanges: [{ startDate: "2021-06-08", endDate: "yesterday" }],
  orderBys: [{
    dimension: {
      orderType: "NUMERIC",
      dimensionName: "date"
    }
  }],
  metricAggregations: ["TOTAL"]
}


export const  makeQueryOneYearObject = (startDate: string, endDate: string, country : string) => {

  if(country === 'all'){

    const activeUserCountryAndOneYearQuery : any ={
      property: `properties/${propertyId}`,
      dimensions:[{"name":"country"},{"name":"month"}],
      metrics:[{"name":"activeUsers"}],
      dateRanges: [{"startDate": `${startDate}`, "endDate": `${endDate}`}],
      dimensionFilter:{
        "filter":
            {"fieldName":"country",
              "inListFilter":{
                "values":
                    ["Japan","South Korea","United States"],
                "caseSensitive":true}}
      },
      orderBys:[
        {"dimension":{"orderType":"ALPHANUMERIC","dimensionName":"month"},"desc":false}],
      metricAggregations:["TOTAL"]
    }


    return activeUserCountryAndOneYearQuery;


  }else {


    const activeUserCountryAndOneYearQuery: any = {
      property: `properties/${propertyId}`,
      dimensions: [{"name": "country"}, {"name": "month"}],
      metrics: [{"name": "activeUsers"}],
      dateRanges: [{"startDate": `${startDate}`, "endDate": `${endDate}`}],
      dimensionFilter: {
        "filter":
            {
              "fieldName": "country",
              "inListFilter": {
                "values":
                    [`${country}`],
                "caseSensitive": true
              }
            }
      },
      orderBys: [{"dimension": {"orderType": "ALPHANUMERIC", "dimensionName": "month"}}],
      metricAggregations: ["TOTAL"]
    }


    return activeUserCountryAndOneYearQuery
  }
}


export const  makeQueryNweekObject = (startDate: string, endDate: string, country : string) => {

  if(country === 'all'){

    const activeUserCountryAndOneYearQuery : any ={
      property: `properties/${propertyId}`,
      dimensions:[{"name":"country"},{"name":"week"}],
      metrics:[{"name":"activeUsers"}],
      dateRanges:[{"startDate":`${startDate}`,"endDate":`${endDate}`}],
      dimensionFilter:{
        "filter":
            {"fieldName":"country",
              "inListFilter":{
              "values":
                  ["Japan","South Korea","United States"],
                "caseSensitive":true}}
      },
      orderBys:[
        {"dimension":{"orderType":"ALPHANUMERIC","dimensionName":"week"},"desc":false}],
      metricAggregations:["TOTAL"]
    }


    return activeUserCountryAndOneYearQuery;


  }else {


    const activeUserCountryAndOneYearQuery : any ={
      property: `properties/${propertyId}`,
      dimensions:[{"name":"country"},{"name":"week"}],
      metrics:[{"name":"activeUsers"}],
      dateRanges:[{"startDate":`${startDate}`,"endDate":`${endDate}`}],
      dimensionFilter:{"filter":
            {"fieldName":"country",
              "inListFilter":{
              "values":
                  [`${country}`],
                "caseSensitive":true}}},
      orderBys:[{"dimension":{"orderType":"ALPHANUMERIC","dimensionName":"country"},"desc":true},
        {"dimension":{"orderType":"ALPHANUMERIC","dimensionName":"week"},"desc":false}],
      metricAggregations:["TOTAL"]}


    return activeUserCountryAndOneYearQuery
  }
}




export const  makeQueryUserAgeRangeObject = (today : string , country : string) => {

  if(country === 'all'){

    const makeQueryUserAgeRangeObject : any ={
      property: `properties/${propertyId}`,
      dimensions:[{"name":"userAgeBracket"}],
      metrics:[{"name":"activeUsers"}],
      dateRanges:[{"startDate":"2021-06-06","endDate":`${today}`}],
      metricAggregations:["TOTAL"]
    }



    return makeQueryUserAgeRangeObject;


  }else {



  const makeQueryUserAgeRangeObject : any ={
     property: `properties/${propertyId}`,
      dimensions:[{"name":"country"},{"name":"userAgeBracket"}],
      metrics:[{"name":"activeUsers"}],
      dateRanges:[{"startDate":"2021-06-06","endDate":`${today}`}],
      dimensionFilter:{"filter":
            {"fieldName":"country",
              "stringFilter":
                  {"matchType":"EXACT"
                   ,"value":`${country}`
                    ,"caseSensitive":false}}
      },
      metricAggregations:["TOTAL"]
  }

    return makeQueryUserAgeRangeObject
  }
}

