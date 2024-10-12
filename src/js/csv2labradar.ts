import Papa, { ParseResult } from "papaparse";
import download from "./download";
import {showError, showSuccess } from "./messages";
import getLabradartemplate from "./getLabradarTemplate";
import nnf from "./nnf";
import getdatestring from "./getdatestring";


export default function csv2labradar(fileData:ArrayBuffer|String,ofilename:String) {
    const start = Date.now();
    
    const dec = new TextDecoder("utf-8")
    const source:string = typeof fileData != 'string' /* 'object'*/ ? dec.decode(fileData as ArrayBuffer) : fileData
    const cleansource = source.replace(', ',',')
    var sourceparts = cleansource.split(/-,{3,}[\n]/)
    var fallback = false
    if (sourceparts.length == 1) {
      console.log(ofilename + ' trying to apply fallback');
      sourceparts = cleansource.split(/^,{6,}$/gm)
      fallback = true
    }
    if (sourceparts.length == 1){
      console.error(ofilename + ' not a working csv file.');
      showError("Error: " + ofilename + ' is not a working csv file.');
      return;
    }
    try {
      var sourceparts0:string[] = sourceparts[0].split('\n')
      const title = sourceparts0.shift()
      const header = sourceparts0.shift()?.split(',')
      const shotlist = sourceparts0.join("\n")
      if (title && header && shotlist) {
        const shots = Papa.parse(shotlist as string,{newline:"\n",skipEmtpyLines:true,dynamicTyping:true} as Papa.ParseConfig)
        var dump:string = "";
        var stats: ParseResult<any>;
        var dt;
        var filename;
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
        const [datestring,hourstring] = getdatestring(dt.data[0][1]);

        if (datestring == 'Invalid Date' || datestring == "01-01-1990" ) {
          throw new Error("Date " + dt.data[0][1] + " does not parse. Ping the dev on github.");
        }
        
        if (ofilename.includes(datestring)) {
          filename = ofilename.replace(/\.csv$/, '-xeroconv.csv');
        } else {
          filename = ofilename.replace(/\.csv$/,'')+'_'+datestring + '_' + hourstring.replace(':','-') + '-xeroconv.csv'
        }
        //extending the stats array for missing values when no bullet weight is available
        if (5 > stats.data.length) {
          stats.data.splice(1,0,["AVERAGE POWER FACTOR",'','','','','',]);
          stats.data.splice(4,0,["Gewicht des Projektils (GRAN)",'','','','','']);
        }
        const unit_velocity = /\(MPS\)/.test(header[1]) ? "m/s":"fps";
        const unit_distance = /\(MPS\)/.test(header[1])  ? "m":"yrds";
        const unit_energy = /\(J\)/.test(header[3]) ? "j": "ft-lbs";
        const unit_weight = /\(GRAN\)/.test(stats.data[4][0]) ? "grains (grs)":"gram (g)";
        
        const speeds = shots.data.map(row => nnf(row[1]));
        const speed_max = Math.max(...speeds);
        const speed_min = Math.min(...speeds);
        const speed_avg = speeds.reduce((a:number, b:number) => a + b) / speeds.length;
    
        var stream = getLabradartemplate()
        stream = stream.replace("{DEVICEID}", "useyournose-xeroconv");
        stream = stream.replace("{SHOTS_TOTAL}",shots.data.length.toString().padStart(4, '0'));
        stream = stream.replaceAll("{UNIT_VELOCITY}",unit_velocity);
        stream = stream.replaceAll("{UNIT_DISTANCE}",unit_distance);
        stream = stream.replaceAll("{UNIT_ENERGY}",unit_energy);
        stream = stream.replaceAll("{UNIT_WEIGHT}",unit_weight);
        stream = stream.replace("{SPEED_AVG}",speed_avg.toString());
        stream = stream.replace("{SPEED_MAX}",speed_max.toString());
        stream = stream.replace("{SPEED_MIN}",speed_min.toString());
        stream = stream.replace("{SPEED_ES}",nnf(stats.data[3][1]).toString());
        stream = stream.replace("{SPEED_SD}",nnf(stats.data[2][1]).toString());
    
        shots.data.forEach(function (item,index) { 
            stream+=item[0].toString().padStart(4, '0') + ";" + nnf(item[1]) +";" + nnf(item[3]) + ";" + nnf(item[4]) + ";"+ nnf(stats.data[4][1]) + ";" + datestring +";" + item[5]  + ";\n";
        })
        console.log("parsed " + title + " in " + (Date.now() - start) + " milliseconds.")
        download(stream,filename)
      }
    } catch(err) {
      console.error(err);
      (err.message) ? showError(err.message) : showError(err);
    } 
  }