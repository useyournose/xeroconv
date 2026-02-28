import db from "../db";
import { ShotEntry, FileInfoEntry, SessionStatsEntry, SessionUnitsEntry} from "../_types"

export async function GetFile(fileid:number):Promise<FileInfoEntry> {
  return await db.files.get(fileid)
}

export async function GetStats(fileid: number):Promise<SessionStatsEntry> {
  return await db.stats.where('fileid').equals(fileid).first()
}

export async function GetUnits(fileid: number):Promise<SessionUnitsEntry> {
  return await db.units.where('fileid').equals(fileid).first()
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