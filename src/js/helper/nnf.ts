function nnf(number?: string | number):number {
  if (!number) {
    return 0
  } else if (typeof number == 'number') {
    return number
    } else if (typeof number == 'string' ) {
    if (number.replace(' ','').length > 0) {
      //parse a comma float string to a nice number float
      return parseFloat(number.toString().replace(',','.'))
    }
  }
  return 0
}

export default nnf;