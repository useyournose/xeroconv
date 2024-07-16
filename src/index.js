import { Stream, Decoder } from "@garmin/fitsdk";
import * as XLSX from "xlsx";
import * as Papa from "papaparse";

import nnf from "./js/nnf";
import getLabradartemplate from "./js/getLabradarTemplate";

document.addEventListener('DOMContentLoaded', () => {

  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if(event.key === "Escape") {
      closeAllModals();
    }
  });
});

let f2linputElement = document.getElementById('fit2labradar');
f2linputElement.addEventListener("change", handleFiles, false);

let c2linputElement = document.getElementById('csv2labradar');
c2linputElement.addEventListener("change", handleFiles, false);

let e2linputElement = document.getElementById('xls2labradar');
e2linputElement.addEventListener("change", handleFiles, false);

function handleFiles() {
  let fileList = this.files;
  let sourceid = this.id;
  if (fileList.length == 0) {
    console.log("no Files in " + source);
    return
  }
  
  for (const file of fileList) {
    let fileReader = new FileReader();
    fileReader.onload = function(event) {
      let FileData = event.target.result;
      let filename = event.target.fileName
      if (event.target.sourceid == 'fit2labradar') {
        fit2labradar(FileData,filename);
      } else if (event.target.sourceid == 'csv2labradar') {
        csv2labradar(FileData,filename);
      } else if (event.target.sourceid == 'xls2labradar') {
        xls2labradar(FileData,filename);
      } else {
        console.error('what is ' +  event.target.sourceid + ' doing here?')
      }
    };
    fileReader.fileName = file.name;
    fileReader.readAsArrayBuffer(file);
    fileReader.sourceid = sourceid
  }
  document.getElementById(sourceid).value = "";
}

function download(text,filename) {
  //inspired from https://stackoverflow.com/a/18197341
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  console.log("file "+ filename +" saved.");
  showSuccess("Saved " + filename + ".");
}



function get_ke(velocity_in_ms, weight_in_grains) {
  //returns the kinetic energy
  const weight_in_kg = weight_in_grains / 15.432 / 1000
  return (Math.round(0.5 * weight_in_kg * Math.pow(velocity_in_ms,2) * 100) / 100).toFixed(2);
}

function fs_to_ms(velocity_in_fs) {
  return velocity_in_fs / 0.3048
}

function getdatestring(datestring) {
  //clean it
  datestring = datestring.replace('at','');
  // convert it
  const date = new Date(Date.parse(datestring));
  //return it
  return [date.getDate().toString().padStart(2,'0') + "-" + (date.getMonth()+1).toString().padStart(2,'0') + "-" + date.getFullYear(),date.getHours().toString().padStart(2,'0') + "-" + date.getMinutes().toString().padStart(2,'0') + "-" + date.getSeconds().toString().padStart(2,'0')];
}

function StandardDeviation(arr) {
  // thanks https://www.geeksforgeeks.org/how-to-get-the-standard-deviation-of-an-array-of-numbers-using-javascript/
  // Creating the mean with Array.reduce
  let mean = arr.reduce((acc, curr) => {
      return acc + curr
  }, 0) / arr.length;
  // Assigning (value - mean) ^ 2 to
  // every array item
  arr = arr.map((k) => {
      return (k - mean) ** 2
  });
  // Calculating the sum of updated array 
  let sum = arr.reduce((acc, curr) => acc + curr, 0);
  // Calculating the variance
  let variance = sum / arr.length
  // Returning the standard deviation
  return Math.sqrt(sum / arr.length)
}



function fit2labradar(fileData,ofilename) {
  const start = Date.now();
  const filename = ofilename.replace(/\.fit$/, '-xeroconv.csv');
  const streamfromFileSync = Stream.fromArrayBuffer(fileData);
  const decoder = new Decoder(streamfromFileSync);
  console.log(ofilename + " isFIT (instance method): " + decoder.isFIT());
  console.log(ofilename + " checkIntegrity: " + decoder.checkIntegrity());
  if (!(decoder.isFIT() && decoder.checkIntegrity())) {
    console.error('not a working fit file.');
    showError("Error: " + ofilename + ' is not a working fit file.');
    return;
  }
  const unit_velocity = "m/s";
  const unit_distance = "m";
  const unit_energy = "j";
  const unit_weight = "grains (grs)"

  const { messages, errors } = decoder.read({
      //mesgListener: (messageNumber, message) => {},
      //applyScaleAndOffset: true,
      expandSubFields: true,
      expandComponents: true,
      convertTypesToStrings: true,
      convertDateTimesToDates: true,
      includeUnknownData: true,
      //mergeHeartRates: true
  });
  if (!(Object.hasOwn(messages,'chronoShotSessionMesgs') & Object.hasOwn(messages,'chronoShotDataMesgs') & Object.hasOwn(messages,'deviceInfoMesgs'))) {
    console.error(ofilename + ' does not contain shot sessions file.');
    showError("Error: " + ofilename + ' does not contain shot sessions file.');
    return;
  }
  try {
    const DeviceData = messages.deviceInfoMesgs[0]
    const SessionData = messages.chronoShotSessionMesgs[0]
    const speeds = messages.chronoShotDataMesgs.map(row => row.shotSpeed)
    const sd = StandardDeviation(speeds);
    const es = SessionData.maxSpeed - SessionData.minSpeed
    var stream = getLabradartemplate()
    stream = stream.replace("{DEVICEID}", DeviceData.manufacturer +'-'+ DeviceData.serialNumber.toString());
    stream = stream.replace("{SHOTS_TOTAL}",SessionData.shotCount.toString().padStart(4, '0'));
    stream = stream.replaceAll("{UNIT_VELOCITY}",unit_velocity);
    stream = stream.replace("{UNIT_DISTANCE}",unit_distance);
    stream = stream.replace("{UNIT_ENERGY}",unit_energy);
    stream = stream.replace("{UNIT_WEIGHT}",unit_weight);
    stream = stream.replace("{SPEED_AVG}",SessionData.avgSpeed);
    stream = stream.replace("{SPEED_MAX}",SessionData.maxSpeed);
    stream = stream.replace("{SPEED_MIN}",SessionData.minSpeed);
    stream = stream.replace("{SPEED_ES}",es);
    stream = stream.replace("{SPEED_SD}",sd);

    messages.chronoShotDataMesgs.forEach(function (item,index) {
        const datestring = item.timestamp.getDate().toString().padStart(2,'0') + "-" + (item.timestamp.getMonth()+1).toString().padStart(2,'0') + "-" + item.timestamp.getFullYear() 
        const timestring = item.timestamp.getHours().toString().padStart(2,'0') + ":" + item.timestamp.getMinutes().toString().padStart(2,'0')+ ":" + item.timestamp.getSeconds().toString().padStart(2,'0')
        stream+=item.shotNum.toString().padStart(4, '0') + ";" + item.shotSpeed +";" + get_ke(item.shotSpeed,SessionData.grainWeight) + ";"+ SessionData.grainWeight + ";" + datestring +";" + timestring  + ";\n";
    })
    console.log("parsed " + ofilename + " in " + (Date.now() - start) + " milliseconds." );
    download(stream,filename);
  } catch(err) {
    console.error(err)
    showError(err.message);
  } 
}

function csv2labradar(fileData,ofilename) {
  const start = Date.now();
  
  const dec = new TextDecoder("utf-8")
  const source = typeof fileData == 'object' ? dec.decode(fileData) : fileData
  const cleansource = source.replaceAll(', ',',')
  var sourceparts = cleansource.split(/-,{3,}[\n]/)
  var fallback = false
  if (sourceparts.length == 1) {
    console.log(ofilename + ' trying to apply fallback');
    sourceparts = cleansource.split(/^,{6,}$/gm)
    fallback = true
  }
  if (sourceparts.length == 1){
    console.error(ofilename + ' not a working csv file.');
    showError("Error: " +ofilename + ' is not a working csv file.');
    return;
  }
  try {
    var sourceparts0 = sourceparts[0].split('\n')
    const title = sourceparts0.shift()
    const header = sourceparts0.shift().split(',')
    const shots = Papa.parse((sourceparts0.join('\n')),{newline:"\n",skipEmtpyLines:true,dynamicTyping:true})
    var dump = "";
    var stats;
    var dt;
    var filename;
    dump = shots.data.pop();
    if (dump !== "") {shots.data.push()};
    if (fallback) {
      dt = {data: []}
      stats = Papa.parse(sourceparts[1],{newline:"\n",skipEmtpyLines:true,dynamicTyping:true})
      dump = stats.data.shift() //get rid of the first newline 
      if (dump !== "") {stats.data.unshift()}
      //fill dt
      dt.data.push((stats.data.pop()))
      dt.data.unshift(stats.data.pop())
    } else {
      stats = Papa.parse(sourceparts[1],{newline:"\n"})
      dump = stats.data.pop();
      if (dump !== "") {stats.data.push()};
      dt = Papa.parse(sourceparts[2],{newline:'\n',quoteChar:'"'})
      dump = dt.data.pop();
      if (dump !== "") {dt.data.push()};
    }
    const [datestring,hourstring] = getdatestring(dt.data[0][1]);
    
    if (ofilename.includes(datestring)) {
      filename = ofilename.replace(/\.csv$/, '-xeroconv.csv');
    } else {
      filename = ofilename.replace(/\.csv$/,'')+'_'+datestring + '_' + hourstring + '-xeroconv.csv'
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
    const speed_avg = speeds.reduce((a, b) => a + b) / speeds.length;

    var stream = getLabradartemplate()
    stream = stream.replace("{DEVICEID}", "useyournose-xeroconv");
    stream = stream.replace("{SHOTS_TOTAL}",shots.data.length.toString().padStart(4, '0'));
    stream = stream.replaceAll("{UNIT_VELOCITY}",unit_velocity);
    stream = stream.replace("{UNIT_DISTANCE}",unit_distance);
    stream = stream.replace("{UNIT_ENERGY}",unit_energy);
    stream = stream.replace("{UNIT_WEIGHT}",unit_weight);
    stream = stream.replace("{SPEED_AVG}",speed_avg);
    stream = stream.replace("{SPEED_MAX}",speed_max);
    stream = stream.replace("{SPEED_MIN}",speed_min);
    stream = stream.replace("{SPEED_ES}",nnf(stats.data[3][1]));
    stream = stream.replace("{SPEED_SD}",nnf(stats.data[2][1]));

    shots.data.forEach(function (item,index) { 
        stream+=item[0].toString().padStart(4, '0') + ";" + nnf(item[1]) +";" + nnf(item[3]) + ";" + nnf(item[4]) + ";"+ nnf(stats.data[4][1]) + ";" + datestring +";" + item[5]  + ";\n";
    })
    console.log("parsed " + title + " in " + (Date.now() - start) + " milliseconds.")
    download(stream,filename)
  } catch(err) {
    console.error(err)
    showError(err.message);
  } 
}

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

let timeoutid;

function showNotification(message,classlist) {
  // inspired from https://www.w3schools.com/howto/howto_js_snackbar.asp
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
  var elem = document.createElement('div');
  elem.classList=classlist;
  elem.id=crypto.randomUUID();
  elem.innerText=message
  x.appendChild(elem)
  setTimeout(function(){document.getElementById(elem.id).remove();}, 3000);
  // Add the "show" class to DIV
  x.className = "show";
  clearTimeout(timeoutid)
  // After 3 seconds, remove the show class from DIV
  timeoutid = setTimeout(function(){ x.className = x.className.replace("show", "")}, 3000);
}

function showError(message) {
  showNotification(message,'notification is-danger')
}

function showSuccess(message) {
  showNotification(message,'notification is-success')
}