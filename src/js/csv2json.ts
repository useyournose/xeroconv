import Papa, { ParseResult } from "papaparse";
import nnf from "./helper/nnf";
import getdatestring, { gettimestamp } from "./helper/getdatestring";
import {AddFile, AddShots, AddStats, AddUnits } from "./services/importService"
import {FileInfo, SessionStats, SessionUnits, ShotSession } from "./_types";
import { crc32Hex } from "./helper/crc32";


export default function csv2json(fileData:ArrayBuffer|string,ofilename:string):Promise<ShotSession> {
  return new Promise(async (resolve,reject) => {
    const start = Date.now();
    const dec = new TextDecoder("utf-8")
    const source:string = typeof fileData != 'string' /* 'object'*/ ? dec.decode(fileData as ArrayBuffer) : fileData
    let checksum:string
    if (typeof fileData != 'string') {
      checksum = crc32Hex(fileData)
    } else {
      const enc = new TextEncoder();
      checksum = crc32Hex(enc.encode(source).buffer)
    }
    const cleansource = source.replace(/, /g,',')
    let sourceparts = cleansource.split(/-,{3,}[\n]/)
    let fallback = false
    if (sourceparts.length == 1) {
      console.log("[csv2db]: " + ofilename + ' trying to apply fallback');
      sourceparts = cleansource.split(/^,{6,}$/gm)
      fallback = true
    }
    if (sourceparts.length == 1){
      console.error("[csv2db]: " + ofilename + ' not a working csv file.');
      reject("Error: " + ofilename + ' is not a working csv file.');
      return;
    }
    try {
      const sourceparts0:string[] = sourceparts[0].split('\n')
      let title = sourceparts0.shift()
      const header = sourceparts0.shift()?.split(',')
      const shotlist = sourceparts0.join("\n")
      if (title && header && shotlist) {
        const shots = Papa.parse(shotlist as string,{newline:"\n",skipEmtpyLines:true,dynamicTyping:true} as Papa.ParseConfig)
        let dump:string = "";
        let stats:ParseResult<any>;
        let dt;
        let filename;
        dump = shots.data.pop();
        if (dump !== "") {shots.data.push()};
        if (fallback) {
          dt = {data: []}
          stats = Papa.parse(sourceparts[1],{newline:"\n",skipEmtpyLines:true,dynamicTyping:true} as Papa.ParseConfig)
          dump = stats.data.shift() //get rid of the first newline 
          if (dump !== "") {stats.data.unshift()}
          //fill dt
          dt.data.push((stats.data.pop()))
          dt.data.unshift(stats.data.pop())
        } else {
          stats = Papa.parse(sourceparts[1],{newline:"\n"} as Papa.ParseConfig)
          dump = stats.data.pop();
          if (dump !== "") {stats.data.push()};
          dt = Papa.parse(sourceparts[2],{newline:'\n',quoteChar:'"'} as Papa.ParseConfig)
          dump = dt.data.pop();
          if (dump !== "") {dt.data.push()};
        }
        const [datestring,hourstring,timestamp] = getdatestring(dt.data[0][1]);

        if (datestring == 'Invalid Date' || datestring == "01-01-1990" ) {
          reject("Date " + dt.data[0][1] + " does not parse. Ping the dev on github.");
          return
        }

        title = title.split('\n')[0].replace(/,{2,}/g,'').replace(/"/g,'');
        
        if (ofilename.includes(datestring) || ofilename.includes((datestring.split('-').reverse().join('-'))) ) {
          filename = ofilename.replace(/\.csv$/, '-xeroconv.csv');
        } else {
          filename = ofilename.replace(/\.csv$/,'')+'_'+datestring + '_' + hourstring.replaceAll(':','-') + '-xeroconv.csv'
        }
        //extending the stats array for missing values when no bullet weight is available
        if (5 > stats.data.length) {
          stats.data.splice(1,0,["AVERAGE POWER FACTOR",'','','','','',]);
          stats.data.splice(4,0,["Gewicht des Projektils (GRAN)",'','','','','']);
        }
        const unit_velocity = /\(MPS\)/i.test(header[1]) ? false : true;
        const unit_distance = /\(MPS\)/i.test(header[1])  ? false : true;
        const unit_energy = /\(J\)/.test(header[3]) ? false : true;
        const unit_weight = /\(GRAN\)*/.test(stats.data[4][0]) ? true : false;
        
        const speeds = shots.data.map(row => nnf(row[1]));
        const speed_max = Math.max(...speeds);
        const speed_min = Math.min(...speeds);
        const speed_avg = Math.round((speeds.reduce((a:number, b:number) => a + b) / speeds.length) * 1000 ) / 1000;
    
        /*/ write data to database
        await AddFile(ofilename,title,"useyournose-xeroconv")
        .then(async (db_fileid) => {
          Promise.all([
          Promise.resolve(db_fileid),
          AddUnits(db_fileid,{
            velocity: unit_velocity,
            distance: unit_distance,
            energy: unit_energy,
            weight: unit_weight ,
          } as SessionUnits ),

          AddStats(db_fileid, {
            shots_total: shots.data.length as number,
            speed_avg: speed_avg,
            speed_max: speed_max,
            speed_min: speed_min,
            speed_es: nnf(stats.data[3][1]),
            speed_sd: nnf(stats.data[2][1]),
            projectile: nnf(stats.data[4][1]),
            timestamp: timestamp,
            timezone: 0
          } as SessionStats),

          AddShots(db_fileid,
            shots.data.map((row) => ({
              shotnumber: row[0] as number,
              velocity: nnf(row[1]),
              energy: nnf(row[3]),
              timestamp: gettimestamp(timestamp, row[5]) as number
            })
          ))])
          .then((values) => {
            resolve(values[0])
          })
      })
      }*/

      return resolve({
        file: {
          name: ofilename,
          title: ofilename,
          deviceid: "useyournose-xeroconv",
          checksum: checksum
        } as FileInfo,
        stats: {
          shots_total: shots.data.length as number,
          speed_avg: speed_avg,
          speed_max: speed_max,
          speed_min: speed_min,
          speed_es: nnf(stats.data[3][1]),
          speed_sd: nnf(stats.data[2][1]),
          projectile: nnf(stats.data[4][1]),
          timestamp: timestamp,
          timezone: 0
        } as SessionStats,
        units: {
          velocity: unit_velocity,
          distance: unit_distance,
          energy: unit_energy,
          weight: unit_weight ,
        } as SessionUnits,
        shots: shots.data.map((row) => ({
              shotnumber: row[0] as number,
              velocity: nnf(row[1]),
              energy: nnf(row[3]),
              timestamp: gettimestamp(timestamp, row[5]) as number 
        }))
      } as ShotSession)
    }
    } catch(err) {
      console.error("[csv2db]: " + err);
      if (Object.hasOwn(err,'message')) {
        reject(err.message)
      } else {
        reject(err);
      }
    }
  }
)}