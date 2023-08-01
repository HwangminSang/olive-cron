exports.validationParamCheck = (text, text1, text2 = '') => {
  if (text === undefined || text === '' || text1 === undefined || text1 === '' || text2 === undefined || text2 === '') {
    return true
  }
  return false
}
