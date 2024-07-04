import { Stream, Decoder } from "https://cdn.jsdelivr.net/npm/@garmin/fitsdk@21.141.0/src/index.min.js";

let f2linputElement = document.getElementById('fit2labradar');
f2linputElement.addEventListener("change", handleFiles, false);

function handleFiles() {
  let fileList = this.files;
  let fileReader = new FileReader();

  fileReader.onload = function(event) {
      let fitFileData = event.target.result;
      let filename = event.target.fileName
      fit2labradar(fitFileData,filename);
  };
  fileReader.fileName = fileList[0].name
  fileReader.readAsArrayBuffer(fileList[0]);
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
  //alert("file saved");
}

function get_ke(velocity_in_ms, weight_in_grains) {
    const weight_in_kg = weight_in_grains / 15.432 / 1000
    return (Math.round(0.5 * weight_in_kg * Math.pow(velocity_in_ms,2) * 100) / 100).toFixed(2);
}

function fit2labradar(fileData,filename) {
  filename = filename.split(/(\\|\/)/g).pop();
  filename = filename.replace(/\.fit$/, '.csv');

  const streamfromFileSync = Stream.fromArrayBuffer(fileData);
  const decoder = new Decoder(streamfromFileSync);
  console.log("isFIT (instance method): " + decoder.isFIT());
  console.log("checkIntegrity: " + decoder.checkIntegrity());
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
  var stream = ""
  stream+="sep=;\n";
  stream+="Device ID;" + DeviceData.manufacturer +'-'+ DeviceData.serialNumber.toString() + ";;\n\n";
  stream+="Series No;0001;;\n";
  stream+="Total number of shots;" +SessionData.shotCount.toString().padStart(4, '0') + ";;\n\n";

  stream+="Units velocity;m/s;;\n";
  stream+="Units distances;m;;\n";
  stream+="Units kinetic energy;j;;\n";
  stream+="Units weight;grains (grs);;\n\n";

  stream+="Stats - Average;"+ SessionData.avgSpeed +";m/s;\n";
  stream+="Stats - Highest;"+ SessionData.maxSpeed +";m/s;\n";
  stream+="Stats - Lowest;"+ SessionData.minSpeed +";m/s;\n";
  stream+="Stats - Ext. Spread;;m/s;\n";
  stream+="Stats - Std. Dev;;m/s;\n\n";

  stream+="Shot ID;V0;Ke0;Proj. Weight;Date;Time\n";
  messages.chronoShotDataMesgs.forEach(function (item,index) {
      const datestring = item.timestamp.getDate().toString().padStart(2,'0') + "-" + (item.timestamp.getMonth()+1).toString().padStart(2,'0') + "-" + item.timestamp.getFullYear() 
      const timestring = item.timestamp.getHours().toString().padStart(2,'0') + ":" + item.timestamp.getMinutes().toString().padStart(2,'0')+ ":" + item.timestamp.getSeconds().toString().padStart(2,'0')
      stream+=item.shotNum.toString().padStart(4, '0') + ";" + item.shotSpeed +";" + get_ke(item.shotSpeed,SessionData.grainWeight) + ";"+ SessionData.grainWeight + ";" + datestring +";" + timestring  + ";\n";
  })
  
  download(stream,filename)
  document.getElementById('fit2labradar').value = "";
}