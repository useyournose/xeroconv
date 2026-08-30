import { Stream, Decoder } from "@garmin/fitsdk";
import { StandardDeviation } from "./helper/StandardDeviation";
import get_ke from "./helper/get_ke";
import nnf from "./helper/nnf";
import { crc32Hex } from "./helper/crc32";

import { FileInfo, SessionStats, SessionUnits, ShotSession} from "./_types";
import { normalizeUnixTimestamp } from "./helper/normalizeUnixTimestamp";


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
    const deviceInfoMesgs = messages.deviceInfoMesgs ?? [];
    const chronoShotSessionMesgs = messages.chronoShotSessionMesgs ?? [];
    const chronoShotDataMesgs = messages.chronoShotDataMesgs ?? [];

    if (deviceInfoMesgs.length === 0 || chronoShotSessionMesgs.length === 0 || chronoShotDataMesgs.length === 0) {
      console.error("[fit2json]: " + ofilename + ' does not contain shot sessions.');
      return reject('Error: ' + ofilename + ' does not contain shot sessions.');
    }
    try {
      const DeviceData = deviceInfoMesgs[0];
      const SessionData = chronoShotSessionMesgs[0];
      const speeds = chronoShotDataMesgs
        .map((row) => row.shotSpeed)
        .filter((speed): speed is number => typeof speed === 'number');
      const sd = StandardDeviation(speeds);
      const maxSpeed = SessionData.maxSpeed ?? 0;
      const minSpeed = SessionData.minSpeed ?? 0;
      const grainWeight = SessionData.grainWeight ?? 0;
      const es = maxSpeed - minSpeed;

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
          deviceid: `${String(DeviceData.manufacturer ?? 'unknown')}-${String(DeviceData.serialNumber ?? 0)}`,
          checksum: checksum
        } as FileInfo,
        stats: {
          shots_total: SessionData.shotCount ?? 0,
          speed_avg: SessionData.avgSpeed ?? 0,
          speed_max: maxSpeed,
          speed_min: minSpeed,
          speed_es: Math.round(es * 1000) / 1000 ,
          speed_sd: Math.round(sd * 1000) / 1000 ,
          projectile: grainWeight,
          timestamp: normalizeUnixTimestamp(SessionData.timestamp?.getTime() ?? 0),
          timezone: 0
        } as SessionStats,
        units: {
          velocity: unit_velocity,
          distance: unit_distance,
          energy: unit_energy,
          weight: unit_weight ,
        } as SessionUnits,
        shots: chronoShotDataMesgs.map((row) => ({
            shotnumber: row.shotNum ?? 0,
            velocity: row.shotSpeed ?? 0,
            energy: nnf(get_ke(row.shotSpeed ?? 0, grainWeight)),
            timestamp: normalizeUnixTimestamp(row.timestamp?.getTime() ?? 0)
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