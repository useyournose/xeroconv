//import { Decoder, Stream, Profile, Utils } from '@garmin/fitsdk';
//import fs from 'fs';
//import path from 'path';

let inputElement = document.getElementById('fit2labradar');
inputElement.addEventListener("change", handleFiles, false);

function handleFiles() {
  let fileList = this.files;
  let fileReader = new FileReader();

  fileReader.onload = function(event) {
    let fitFileData = event.target.result;
    fit2labradar(fitFileData);
  };
  
  fileReader.readAsArrayBuffer(fileList[0]);
}

function convertToJSON(fileData) {
  let formattedData = fileData.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t');
  let jsonData = '[' + formattedData + ']';
  
  document.getElementById('output').innerHTML = jsonData;
}

function get_ke(velocity_in_ms, weight_in_grains) {
    const weight_in_kg = weight_in_grains / 15.432 / 1000
    return (Math.round(0.5 * weight_in_kg * Math.pow(velocity_in_ms,2) * 100) / 100).toFixed(2);
}

function fit2labradar(fileData) {
    //const inputfile = './in/06-18-2024_15-47-11.fit'
    //const outputfile = './out/out.csv'

    //const buf = fs.readFileSync(inputfile);
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

    console.log(errors);
    console.log(messages);
    console.log(messages.fileIdMesgs[0]);
    console.log(messages.fileCreatorMesgs[0]);
    console.log(messages.deviceInfoMesgs[0]);
    console.log(messages.chronoShotSessionMesgs[0]);
    console.log(messages.chronoShotDataMesgs[0]);

    const DeviceData = messages.deviceInfoMesgs[0]
    const SessionData = messages.chronoShotSessionMesgs[0]

    var stream = ""//fs.createWriteStream(outputfile, {flags:'a'});

    stream+="sep=;\n";
    stream+="Device ID;" + DeviceData.manufacturer +'-'+ DeviceData.serialNumber.toString() + ";;\n\n";
    stream+="Series No;"+ path.basename(inputfile) +";;\n";
    /*stream.write("Total number of shots;" +SessionData.shotCount.toString().padStart(4, '0') + ";;\n\n");

    stream.write("Units velocity;m/s;;\n");
    stream.write("Units distances;m;;\n");
    stream.write("Units kinetic energy;j;;\n");
    stream.write("Units weight;grains (grs);;\n\n");

    stream.write("Stats - Average;"+ SessionData.avgSpeed +";m/s;\n");
    stream.write("Stats - Highest;"+ SessionData.maxSpeed +";m/s;\n");
    stream.write("Stats - Lowest;"+ SessionData.minSpeed +";m/s;\n");
    stream.write("Stats - Ext. Spread;;m/s;\n");
    stream.write("Stats - Std. Dev;;m/s;\n\n");

    stream.write("Shot ID;V0;Ke0;Proj. Weight;Date;Time\n")
    messages.chronoShotDataMesgs.forEach(function (item,index) {
        const datestring = item.timestamp.getDate() + "-" + (item.timestamp.getMonth()+1) + "-" + item.timestamp.getFullYear() 
        const timestring = item.timestamp.getHours().toString().padStart(2,'0') + ":" + item.timestamp.getMinutes().toString().padStart(2,'0')+ ":" + item.timestamp.getSeconds().toString().padStart(2,'0')
        stream.write(item.shotNum.toString().padStart(4, '0') + ";" + item.shotSpeed +";" + get_ke(item.shotSpeed,SessionData.grainWeight) + ";"+ SessionData.grainWeight + ";" + datestring +";" + timestring  + ";\n");
    })

    stream.end();*/
    document.getElementById('output').innerHTML = stream
}