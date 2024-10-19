import { Stream, Decoder } from "@garmin/fitsdk";
import download from "./download";
//import { showError, showSuccess } from "./messages";
import getLabradartemplate from "./getLabradarTemplate";
import StandardDeviation from "./StandardDeviation";
import get_ke from "./get_ke";
import getdatestring from "./getdatestring";

export default function fit2labradar(fileData:ArrayBuffer,ofilename:string):Promise<string> {
  return new Promise((resolve,reject) => {
    const start = Date.now();
    const filename = ofilename.replace(/\.fit$/, '-xeroconv.csv');
    const streamfromFileSync = Stream.fromArrayBuffer(fileData);
    const decoder = new Decoder(streamfromFileSync);
    console.log("[fit2labradar]: " + ofilename + " isFIT (instance method): " + decoder.isFIT());
    console.log("[fit2labradar]: " + ofilename + " checkIntegrity: " + decoder.checkIntegrity());
    if (!(decoder.isFIT() && decoder.checkIntegrity())) {
      console.error("[fit2labradar]: " + ofilename + ' - not a working fit file.');
      reject('Error: ' + ofilename + ' - not a working fit file.');
      return
    }
    const unit_velocity:string = "m/s";
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
    if (errors.length > 0) {
      console.error("[fit2labradar]: " + ofilename + " - Error found during reading.");
      reject("Error" + ofilename + " - Error found during reading.");
      return
    }
    if (!(Object.hasOwn(messages,'chronoShotSessionMesgs') && Object.hasOwn(messages,'chronoShotDataMesgs') && Object.hasOwn(messages,'deviceInfoMesgs'))) {
      //showError("Error: " + ofilename + ' does not contain shot sessions file.');
      console.error("[fit2labradar]: " + ofilename + ' does not contain shot sessions.');
      reject('Error: ' + ofilename + ' does not contain shot sessions.');
      return
    }
    try {
      const DeviceData = messages.deviceInfoMesgs[0]
      const SessionData = messages.chronoShotSessionMesgs[0]
      const speeds = messages.chronoShotDataMesgs.map(row => row.shotSpeed)
      const sd = StandardDeviation(speeds);
      const es = SessionData.maxSpeed - SessionData.minSpeed
      let stream = getLabradartemplate();
      stream = stream.replaceAll("{DEVICEID}", DeviceData.manufacturer +'-'+ DeviceData.serialNumber.toString());
      stream = stream.replaceAll("{SHOTS_TOTAL}",SessionData.shotCount.toString().padStart(4, '0'));
      stream = stream.replaceAll("{UNIT_VELOCITY}",unit_velocity);
      stream = stream.replaceAll("{UNIT_DISTANCE}",unit_distance);
      stream = stream.replaceAll("{UNIT_ENERGY}",unit_energy);
      stream = stream.replaceAll("{UNIT_WEIGHT}",unit_weight);
      stream = stream.replace("{SPEED_AVG}",SessionData.avgSpeed.toString());
      stream = stream.replace("{SPEED_MAX}",SessionData.maxSpeed.toString());
      stream = stream.replace("{SPEED_MIN}",SessionData.minSpeed.toString());
      stream = stream.replace("{SPEED_ES}",es.toFixed(2).toString());
      stream = stream.replace("{SPEED_SD}",sd.toFixed(2).toString());

      messages.chronoShotDataMesgs.forEach(function (item,index) {
        const [datestring,timestring] = getdatestring(item.timestamp);
        if (datestring == 'Invalid Date' || datestring == "01-01-1990" ) {
          reject("Date " + item.timestamp + " does not parse. Ping the dev on github.");
        }
        stream+=item.shotNum.toString().padStart(4, '0') + ";" + item.shotSpeed +";" + get_ke(item.shotSpeed,SessionData.grainWeight) + ";"+ SessionData.grainWeight + ";" + datestring +";" + timestring  + ";\n";
      })
      console.log("[fit2labradar]: parsed " + ofilename + " in " + (Date.now() - start) + " milliseconds." );
      const downloadstatus:Promise<string|boolean> = download(stream,filename)
      downloadstatus
      .then((value) => {resolve(value.toString())})
      .catch((error) => {console.error(error); reject(error as string); return;})
    } catch(err) {
      console.error(err);
      if (Object.hasOwn(err,'message')) {
        reject(err.message)
      } else {
        reject(err);
      }
    }
  })
}