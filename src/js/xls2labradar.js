import * as XLSX from "xlsx";
import csv2labradar from "./csv2labradar";

function xls2labradar(fileData,ofilename) {
    const xlsfile = XLSX.read(fileData, {type:"array"});
    for (const sheetname of xlsfile.SheetNames) {
      var worksheet = xlsfile.Sheets[sheetname]
      const csvdata = XLSX.utils.sheet_to_csv(worksheet);
      var title = csvdata.split('\n')[0].replaceAll(',','');
      csv2labradar(csvdata,title+'.csv')
      console.log(sheetname);
    }
}

module.exports = xls2labradar;