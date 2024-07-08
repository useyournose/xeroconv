import { Stream, Decoder } from "https://cdn.jsdelivr.net/npm/@garmin/fitsdk@21.141.0/src/index.min.js";

let f2linputElement = document.getElementById('fit2labradar');
f2linputElement.addEventListener("change", handleFiles, false);

let c2linputElement = document.getElementById('csv2labradar');
c2linputElement.addEventListener("change", handleFiles, false);

function handleFiles() {
  let fileList = this.files;
  let fileReader = new FileReader();
  let sourceid = this.id;

  fileReader.onload = function(event) {
      let FileData = event.target.result;
      let filename = event.target.fileName
      if (event.target.sourceid == 'fit2labradar') {
        fit2labradar(FileData,filename);
      } else if (event.target.sourceid == 'csv2labradar') {
        csv2labradar(FileData,filename);
      } else {
        console.error('what is ' +  event.target.sourceid + ' doing here?')
      }
  };
  fileReader.fileName = fileList[0].name
  fileReader.readAsArrayBuffer(fileList[0]);
  fileReader.sourceid = sourceid
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
}

function nnf(number) {
  //parse a comma float string to a nice number float
  return parseFloat(number.replace(',','.'))
}

function get_ke(velocity_in_ms, weight_in_grains) {
  //returns the kinetic energy
  const weight_in_kg = weight_in_grains / 15.432 / 1000
  return (Math.round(0.5 * weight_in_kg * Math.pow(velocity_in_ms,2) * 100) / 100).toFixed(2);
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
  console.log("isFIT (instance method): " + decoder.isFIT());
  console.log("checkIntegrity: " + decoder.checkIntegrity());
  if (!(decoder.isFIT() && decoder.checkIntegrity())) {
    alert('not a working fit file.');
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
  const DeviceData = messages.deviceInfoMesgs[0]
  const SessionData = messages.chronoShotSessionMesgs[0]
  const speeds = messages.chronoShotDataMesgs.map(row => row.shotSpeed)
  const sd = StandardDeviation(speeds);
  const es = SessionData.maxSpeed - SessionData.minSpeed
  var stream = ""
  stream+="sep=;\n";
  stream+="Device ID;" + DeviceData.manufacturer +'-'+ DeviceData.serialNumber.toString() + ";;\n\n";
  stream+="Series No;0001;;\n";
  stream+="Total number of shots;" +SessionData.shotCount.toString().padStart(4, '0') + ";;\n\n";

  stream+="Units velocity;"+unit_velocity+";;\n";
  stream+="Units distances;"+unit_distance+";;\n";
  stream+="Units kinetic energy;"+unit_energy+";;\n";
  stream+="Units weight;"+ unit_weight +";;\n\n";

  stream+="Stats - Average;"+ SessionData.avgSpeed +";"+unit_velocity+";\n";
  stream+="Stats - Highest;"+ SessionData.maxSpeed +""+unit_velocity+";\n";
  stream+="Stats - Lowest;"+ SessionData.minSpeed +";"+unit_velocity+";\n";
  stream+="Stats - Ext. Spread;"+es+";"+unit_velocity+";\n";
  stream+="Stats - Std. Dev;"+sd+";"+unit_velocity+";\n\n";

  stream+="Shot ID;V0;Ke0;Proj. Weight;Date;Time\n";
  messages.chronoShotDataMesgs.forEach(function (item,index) {
      const datestring = item.timestamp.getDate().toString().padStart(2,'0') + "-" + (item.timestamp.getMonth()+1).toString().padStart(2,'0') + "-" + item.timestamp.getFullYear() 
      const timestring = item.timestamp.getHours().toString().padStart(2,'0') + ":" + item.timestamp.getMinutes().toString().padStart(2,'0')+ ":" + item.timestamp.getSeconds().toString().padStart(2,'0')
      stream+=item.shotNum.toString().padStart(4, '0') + ";" + item.shotSpeed +";" + get_ke(item.shotSpeed,SessionData.grainWeight) + ";"+ SessionData.grainWeight + ";" + datestring +";" + timestring  + ";\n";
  })
  console.log("parsed " + ofilename + " in " + (Date.now() - start) + " milliseconds." );
  download(stream,filename);
  document.getElementById('fit2labradar').value = "";
}

function csv2labradar(fileData,filename) {
  const start = Date.now();
  filename = filename.replace(/\.csv$/, '-xeroconv.csv');
  const dec = new TextDecoder("utf-8")
  const source = dec.decode(fileData)
  const sourceparts = source.split(/-,{6}[\n]/)
  if (sourceparts.length != 3){
    alert('not a working csv file.');
    return;
  }
  var sourceparts0 = sourceparts[0].split('\n')
  const title = sourceparts0.shift()
  const header = sourceparts0.shift().split(',')
  const shots = Papa.parse((sourceparts0.join('\n')),{newline:"\n",skipEmtpyLines:true,dynamicTyping:true})
  var dump = "";
  dump = shots.data.pop();
  if (dump !== "") {shots.data.push()};
  const stats = Papa.parse(sourceparts[1],{newline:"\n"})
  dump = stats.data.pop();
  if (dump !== "") {stats.data.push()};
  const dt = Papa.parse(sourceparts[2],{newline:"\n"})
  dump = dt.data.pop();
  if (dump !== "") {dt.data.push()};
  const date = new Date(Date.parse(dt.data[0][1]))
  const datestring = date.getDate().toString().padStart(2,'0') + "-" + (date.getMonth()+1).toString().padStart(2,'0') + "-" + date.getFullYear();

  const unit_velocity = /\(MPS\)/.test(header[1]) ? "m/s":"fps";
  const unit_distance = /\(MPS\)/.test(header[1])  ? "m":"yrds";
  const unit_energy = /\(J\)/.test(header[3]) ? "j": "ft-lbs";
  const unit_weight = /\(GRAN\)/.test(stats.data[4][0]) ? "grains (grs)":"gram (g)";
  const speeds = shots.data.map(row => parseFloat(row[1].replace(',','.')));
  const speed_max = Math.max(...speeds);
  const speed_min = Math.min(...speeds);

  var stream = ""
  stream+="sep=;\n";
  stream+="Device ID;useyournose-xeroconv;;\n\n";
  stream+="Series No;0001;;\n";
  stream+="Total number of shots;" + shots.data.length.toString().padStart(4, '0') + ";;\n\n";

  stream+="Units velocity;"+unit_velocity+";;\n";
  stream+="Units distances;"+unit_distance+";;\n";
  stream+="Units kinetic energy;"+unit_energy+";;\n";
  stream+="Units weight;"+ unit_weight +";;\n\n";

  stream+="Stats - Average;"+ stats.data[0][1] +";"+unit_velocity+";\n";
  stream+="Stats - Highest;"+ speed_max +";"+unit_velocity+";\n";
  stream+="Stats - Lowest;"+ speed_min +";"+unit_velocity+";\n";
  stream+="Stats - Ext. Spread;"+ nnf(stats.data[3][1]) + ";" +unit_velocity+ ";\n";
  stream+="Stats - Std. Dev;"+ nnf(stats.data[2][1]) + ";"+unit_velocity+";\n\n";

  stream+="Shot ID;V0;Ke0;PF10;Proj. Weight;Date;Time\n";
  shots.data.forEach(function (item,index) { 
      stream+=item[0].toString().padStart(4, '0') + ";" + nnf(item[1]) +";" + nnf(item[3]) + ";" + nnf(item[4]) + ";"+ stats.data[4][1] + ";" + datestring +";" + item[5]  + ";\n";
  })
  console.log("parsed " + title + " in " + (Date.now() - start) + " milliseconds.")
  download(stream,filename)
  document.getElementById('csv2labradar').value = "";
}