import { Stream, Decoder } from "@garmin/fitsdk";
import { StandardDeviation } from "./helper/StandardDeviation";
import get_ke from "./helper/get_ke";
import nnf from "./helper/nnf";
import { crc32Hex } from "./helper/crc32";

import { FileInfo, SessionStats, SessionUnits, ShotSession} from "./_types";


export default async function fit2json(fileData:ArrayBuffer,ofilename:string):Promise<ShotSession | string> {
  return new Promise(async (resolve,reject) => {
    const start = Date.now();
    const filename = ofilename.replace(/\.fit$/, '-xeroconv.csv');
    
    const checksum = crc32Hex(fileData)
    const streamfromFileSync = Stream.fromArrayBuffer(fileData);
    const decoder = new Decoder(streamfromFileSync);
    console.log("[fit2json]: " + ofilename + " isFIT (instance method): " + decoder.isFIT());
    console.log("[fit2json]: " + ofilename + " checkIntegrity: " + decoder.checkIntegrity());
    if (!(decoder.isFIT() && decoder.checkIntegrity())) {
      console.error("[fit2json]: " + ofilename + ' - not a working fit file.');
      return reject('Error: ' + ofilename + ' - not a working fit file.');
    }

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
      console.error("[fit2json]: " + ofilename + " - Error found during reading.");
      return reject("Error" + ofilename + " - Error found during reading.");
    }
    if (!(Object.hasOwn(messages,'chronoShotSessionMesgs') && Object.hasOwn(messages,'chronoShotDataMesgs') && Object.hasOwn(messages,'deviceInfoMesgs'))) {
      //showError("Error: " + ofilename + ' does not contain shot sessions file.');
      console.error("[fit2json]: " + ofilename + ' does not contain shot sessions.');
      return reject('Error: ' + ofilename + ' does not contain shot sessions.');
    }
    try {
      const DeviceData = messages.deviceInfoMesgs[0]
      const SessionData = messages.chronoShotSessionMesgs[0]
      const speeds = messages.chronoShotDataMesgs.map(row => row.shotSpeed)
      const sd = StandardDeviation(speeds);
      const es = SessionData.maxSpeed - SessionData.minSpeed

      const unit_velocity= false;
      const unit_distance = false;
      const unit_energy = false;
      const unit_weight = false;
      
      console.log("[fit2json]: parsed " + ofilename + " in " + (Date.now() - start) + " milliseconds." );
      //resolve(values[0])

      return resolve({
        file: {
          name: ofilename,
          title: ofilename,
          deviceid: DeviceData.manufacturer +'-'+ DeviceData.serialNumber.toString(),
          checksum: checksum
        } as FileInfo,
        stats: {
          shots_total: SessionData.shotCount,
          speed_avg: SessionData.avgSpeed,
          speed_max: SessionData.maxSpeed,
          speed_min: SessionData.minSpeed,
          speed_es: Math.round(es * 1000) / 1000 ,
          speed_sd: Math.round(sd * 1000) / 1000 ,
          projectile: SessionData.grainWeight,
          timestamp: SessionData.timestamp.getTime(),
          timezone: 0
        } as SessionStats,
        units: {
          velocity: unit_velocity,
          distance: unit_distance,
          energy: unit_energy,
          weight: unit_weight ,
        } as SessionUnits,
        shots: messages.chronoShotDataMesgs.map((row) => ({
            shotnumber: row.shotNum as number,
            velocity: row.shotSpeed,
            energy: nnf(get_ke(row.shotSpeed,SessionData.grainWeight)),
            timestamp: row.timestamp.getTime()
        }))
      } as ShotSession)
    } catch(err) {
      console.error(err);
      if (Object.hasOwn(err,'message')) {
        return reject(err.message)
      } else {
        return reject(err);
      }
    }
  })
}