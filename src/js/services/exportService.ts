import db from "../db";
import { ShotEntry, FileInfoEntry, SessionStatsEntry, SessionUnitsEntry} from "../_types"

export async function GetFile(fileid:number):Promise<FileInfoEntry> {
  const file = await db.files.get(fileid)
  if (!file) throw new Error(`File ${fileid} was not found`)
  return file
}

export async function GetStats(fileid: number):Promise<SessionStatsEntry> {
  const stats = await db.stats.where('fileid').equals(fileid).first()
  if (!stats) throw new Error(`Stats for file ${fileid} were not found`)
  return stats
}

export async function GetUnits(fileid: number):Promise<SessionUnitsEntry> {
  const units = await db.units.where('fileid').equals(fileid).first()
  if (!units) throw new Error(`Units for file ${fileid} were not found`)
  return units
}

export async function GetShots(fileid: number):Promise<ShotEntry[]> {
  return await db.shots.where('fileid').equals(fileid).toArray()
}

/*
export function GetSpeeds (fileid: number) {
    const query = db.query(`select velocity from shots where fileid = $fileid`)
    query.all({ $fileid: fileid}) as number[]
}

export function GetSpeedBins (fileid:number, binSize:number = 10) {
    const query = db.query(`
        SELECT CAST(velocity / $binSize AS INTEGER) AS bin, COUNT(*) AS cnt
        FROM shots
        WHERE fileid = $fileid
        GROUP BY bin
        ORDER BY bin
        `)
    query.all({$fileid: fileid, $binSize: binSize}) as any;
}*/