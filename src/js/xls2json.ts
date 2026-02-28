import XLSX from "xlsx";
import csv2json from "./csv2json";
import { showError } from "./messages";
import { ShotSession } from "./_types";

export default function xls2json(fileData:ArrayBuffer,ofilename:string):Promise<ShotSession[]> {
  return new Promise(async (resolve,reject) => {
    const Sessions:ShotSession[] = []
    const xlsfile = XLSX.read(fileData, {type:"array"});
    var promises:Promise<boolean>[] = xlsfile.SheetNames.map(async (sheetname) => {
      return new Promise((resolve,reject) => {
        const worksheet = xlsfile.Sheets[sheetname]
        const csvdata = XLSX.utils.sheet_to_csv(worksheet);
        const title = csvdata.split('\n')[0].replace(/,{2,}/g,'').replace(/"/g,'');
        csv2json(csvdata,title+'.csv')
        .then((Session) => {
          Sessions.push(Session as ShotSession)
          console.log("[xls2json]: parsed "+sheetname);
          return resolve(true)
        })
        .catch((err) => {
          console.warn("[xls2json]: "+err);
          showError(err);
          return reject(err)
        })
      })
    })
    await Promise.allSettled(promises)
    .then((values) => {
      return resolve(Sessions)
    })
    .catch((err) => {
      return reject(err)
    })
  })
}