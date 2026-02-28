import db from "../db";
import { Shot, SessionStats,SessionUnits, SessionUnitsEntry, FileInfoEntry, SessionStatsEntry, ShotEntry, ShotSession } from "../_types"


export async function AddFile(name: string, title: string, deviceid: string, checksum?: string):Promise<number> {
  if (await db.files.where('checksum').equals(checksum).count() == 0 ) {
    return await db.files.add({name: name, title: title, deviceid: deviceid, exported: 0, added: Date.now(), checked: 0, checksum: checksum} as FileInfoEntry)
  } else {
    return Promise.reject("File with the same checksum already exists in IndexedDB")
  }
}

export async function AddStats(
  fileid: number,
  Stat: SessionStats
  ) {
    if (Stat.timestamp > 9999999999) {
      Stat.timestamp = Stat.timestamp / 1000
    };
    return await db.stats.add(
        {...{fileid: fileid}, ...Stat} as SessionStatsEntry
  )
}

export async function AddUnits(
  fileid: number,
  units:SessionUnits
){
  return await db.units.add(
      {...{fileid: fileid}, ...units} as SessionUnitsEntry
  )
}

export async function AddShots(fileid: number, shots:Shot[]) {
  const FShots:ShotEntry[] = shots.map(shot => ({...shot, fileid: fileid}))
  FShots.map(shot =>
    {
      if (shot.timestamp > 9999999999) {
        shot.timestamp = shot.timestamp / 1000
      };
    }
  )
  return await db.shots.bulkAdd(FShots)
}

export async function AddSession(Session:ShotSession):Promise<number> {
  return new Promise(async (resolve,reject) => {
    await AddFile(Session.file.name, Session.file.title, Session.file.deviceid, Session.file.checksum)
    .then(async (db_fileid) => {
      Promise.all([
        Promise.resolve(db_fileid),
        AddUnits(db_fileid,{
            velocity: Session.units.velocity,
            distance: Session.units.distance,
            energy: Session.units.energy,
            weight: Session.units.weight ,
          } as SessionUnits ),
        AddStats(db_fileid, {
            shots_total: Session.stats.shots_total,
            speed_avg: Session.stats.speed_avg,
            speed_max: Session.stats.speed_max,
            speed_min: Session.stats.speed_min,
            speed_es: Session.stats.speed_es,
            speed_sd: Session.stats.speed_sd,
            projectile: Session.stats.projectile,
            timestamp: Session.stats.timestamp,
            timezone: 0
          } as SessionStats),
        AddShots(db_fileid,Session.shots)
      ])
      .then((values) => {
        console.log("[json2db]: added " + Session.file.name );
        resolve(values[0]);
      })
    })
    .catch((err) => {
      return reject(err)
    })
  })
}