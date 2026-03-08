import Papa, { ParseResult } from "papaparse";
import nnf from "./helper/nnf";
import getdatestring, { gettimestamp } from "./helper/getdatestring";
import {AddFile, AddShots, AddStats, AddUnits } from "./services/importService"
import {FileInfo, SessionStats, SessionUnits, ShotSession } from "./_types";
import { crc32Hex } from "./helper/crc32";
import { stripVTControlCharacters } from "util";
import dayjs from "dayjs";


function cleanup(input:string[]):string[] {
  let dump = ""
  while (dump == "" && input.length > 0) {
    dump = input.pop()
  }
  input.push(dump)

  while (input[0] == "" && input.length > 0) {
    dump = input.shift()
  }

  return input
}

function cleanupArray(input:string[]):string[] {
  let output = input.map(val => val.replace(/^\n/,''))
  return output.filter((item): item is string => item !== null && item.length > 0)
}

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
    let sourceparts = cleansource.split(/^,{6,}$/gm)
    sourceparts = cleanupArray(sourceparts)

    // currently the xlsx looks a bit fragile. Assuming future changes here...
    if (sourceparts.length == 1 || sourceparts.length != 7){
      console.error("[rcsv2db]: " + ofilename + ' not a working csv file.');
      reject("Error: " + ofilename + ' is not a working csv file.');
      return;
    }

    try {
      let dump:string = "";
      //cartridge
      const sourceparts0:string[] = cleanup(sourceparts[0].split('\n'))
      // tool name
      const sourceparts1:string[] = cleanup(sourceparts[1].split('\n'))
      // tool stats
      const sourceparts2:string[] = cleanup(sourceparts[2].split('\n'))
      // weather title
      const sourceparts3:string[] = cleanup(sourceparts[3].split('\n'))
      //weather stats
      const sourceparts4:string[] = cleanup(sourceparts[4].split('\n'))
      // sessions stats
      const sourceparts5:string[] = cleanup(sourceparts[5].split('\n'))
      // shots & header
      const sourceparts6:string[] = cleanup(sourceparts[6].split('\n'))

      // map to used variables
      const statstable = sourceparts5
      const shotstable = sourceparts6

      // needs work
      let title = ofilename

      // prep header and shotlist
      dump = shotstable.shift()
      const header = shotstable.shift()?.split(',')
      const shotlist = shotstable.join('\n')


      if (statstable && header && shotlist) {
        const shots = Papa.parse(shotlist as string,{newline:"\n",skipEmtpyLines:true,dynamicTyping:true} as Papa.ParseConfig)
        let stats:ParseResult<any>;
        let filename;

        //get times from sheetname
        const [datestring,hourstring,timestamp] = getdatestring(ofilename.split('.')[0]);

        // prep stats
        // # get title line
        let statstitle = statstable.shift().replaceAll(',','')
        stats = Papa.parse(statstable.join('\n'),{newline:"\n",skipEmtpyLines:true,dynamicTyping:true} as Papa.ParseConfig)

        //extending the stats array for missing values when no bullet weight is available
        //if (5 > stats.data.length) {
        //  stats.data.splice(1,0,["AVERAGE POWER FACTOR",'','','','','',]);
        //  stats.data.splice(4,0,["Gewicht des Projektils (GRAN)",'','','','','']);
        //}

        const unit_velocity = /\(MPS\)/i.test(header[1]) ? false : true;
        const unit_distance = /\(MPS\)/i.test(header[1])  ? false : true;
        const unit_energy = /\(J\)/.test(header[3]) ? false : true;
        const unit_weight = /\sgr$/.test(stats.data[0][1]) ? true : false;
        
        const speeds = shots.data.map(row => nnf(row[1]));
        const speed_max = Math.max(...speeds);
        const speed_min = Math.min(...speeds);
        const speed_avg = Math.round((speeds.reduce((a:number, b:number) => a + b) / speeds.length) * 1000 ) / 1000;
    
        // build nice filename and title
        filename = statstitle +'_'+ stats.data[0][1] + '_' + datestring + '_' + hourstring.replaceAll(':','-') + '-xeroconv.csv'
        title = statstitle +'_'+ stats.data[0][1] +'_'+ datestring + '_' + hourstring.replaceAll(':','-')
        
        return resolve({
          file: {
            name: filename,
            title: title,
            deviceid: "useyournose-xeroconv(rangecraft)",
            checksum: checksum
          } as FileInfo,
          stats: {
            shots_total: shots.data.length as number,
            speed_avg: speed_avg,
            speed_max: speed_max,
            speed_min: speed_min,
            speed_es: nnf(stats.data[5][1]),
            speed_sd: nnf(stats.data[4][1]),
            projectile: nnf(stats.data[0][1]),
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
      console.error("[rcsv2db]: " + err);
      if (Object.hasOwn(err,'message')) {
        reject(err.message)
      } else {
        reject(err);
      }
    }
  }
)}