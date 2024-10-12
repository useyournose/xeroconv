import { Stream, Decoder } from "@garmin/fitsdk";
import download from "./download";
import { showError, showSuccess } from "./messages";
import getLabradartemplate from "./getLabradarTemplate";
import StandardDeviation from "./StandardDeviation";
import get_ke from "./get_ke";
import getdatestring from "./getdatestring";

export default async function fit2labradar(fileData:ArrayBuffer,ofilename:string) {
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
    if (!(Object.hasOwn(messages,'chronoShotSessionMesgs') && Object.hasOwn(messages,'chronoShotDataMesgs') && Object.hasOwn(messages,'deviceInfoMesgs'))) {
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
            throw new Error("Date " + item.timestamp + " does not parse. Ping the dev on github.");
          }
          stream+=item.shotNum.toString().padStart(4, '0') + ";" + item.shotSpeed +";" + get_ke(item.shotSpeed,SessionData.grainWeight) + ";"+ SessionData.grainWeight + ";" + datestring +";" + timestring  + ";\n";
      })
      console.log("parsed " + ofilename + " in " + (Date.now() - start) + " milliseconds." );
      download(stream,filename);
      return
    } catch(err) {
      console.error(err);
      (err.message) ? showError(err.message) : showError(err);
      return
    } 
  }