function getdatestring(datestring) {
    //clean it
    datestring = datestring.replace('at','');
    // convert it
    const date = new Date(Date.parse(datestring));
    //return it
    return [date.getDate().toString().padStart(2,'0') + "-" + (date.getMonth()+1).toString().padStart(2,'0') + "-" + date.getFullYear(),date.getHours().toString().padStart(2,'0') + "-" + date.getMinutes().toString().padStart(2,'0') + "-" + date.getSeconds().toString().padStart(2,'0')];
  }

module.exports = getdatestring;