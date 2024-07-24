import { Stream, Decoder } from "@garmin/fitsdk";
import download from "./download.mjs";
import { showError, showSuccess } from "./messages.mjs";
import getLabradartemplate from "./getLabradarTemplate.mjs";
import StandardDeviation from "./StandardDeviation.mjs";
import get_ke from "./get_ke.mjs";

export default function fit2labradar(fileData,ofilename) {
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