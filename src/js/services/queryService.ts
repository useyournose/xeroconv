import db from "../db";
import {SessionStats, Shot, SessionUnits, TFileInfoEntry, RawDataset} from '../_types'
import ms_to_fs from "../helper/ms_to_fs";
import fs_to_ms from "../helper/fs_to_ms";

export async function GetFiles():Promise<TFileInfoEntry[]>{

    const files:TFileInfoEntry[] = await db.files.toArray()
    const result = await Promise.all(files.map(async file => {
        const stats = await db.stats.where('fileid').equals(file.id).first()
        file.stats = stats

        if (file.stats.speed_es != file.stats.speed_max - file.stats.speed_min) {
            console.log("spread " + file.stats.speed_es.toString() + " not matching, updating.")
            file.stats.speed_es = Math.round((file.stats.speed_max - file.stats.speed_min) * 1000) / 1000
        }

    }))
    return files

    /*
    const someBands = await Promise.all(bands.map(async band => {
        band.albums = await db.albums.where('id').anyOf(band.albumIds).toArray()
        return band
    }));
    */
}

export async function MarkFileAsExported(fileid: number):Promise<number> {
    return db.files.update(fileid, {exported: 1})
}

export async function MarkFileAsChecked(fileid: number):Promise<number> {
    return db.files.update(fileid, {checked: 1})
}

export async function MarkFileAsUnchecked(fileid: number):Promise<number> {
    return db.files.update(fileid, {checked: 0})
}

export function bulmaColorRGBA(alpha = 1): string {
  const fallback = 'rgba(128,128,128,1)'
  const root = getComputedStyle(document.documentElement);
  // Bulma registers an RGB tuple as --bulma-{name}-rgb (three numbers separated by commas)
  const rgbVar = root.getPropertyValue(`--bulma-primary-rgb`).trim();
  if (rgbVar) {
    // rgbVar often looks like "34, 139, 230" so we can interpolate directly
    return `rgba(${rgbVar}, ${alpha})`;
  } else {
    return fallback
  }
}

function convvelo(velocity: number, su: boolean, tu: boolean) {
    if (su == tu) {
        return velocity
    }
    if (su == true && tu == false) {
        return ms_to_fs(velocity)
    }
    if (su == false && tu == true) {
        return fs_to_ms(velocity)
    }
}

export async function GetCheckedShots(targetunits: boolean = false):Promise<RawDataset[]> {
    let speedDatasets: RawDataset[] = []
    const files = await db.files.where('checked').equals(1).toArray()
    
    const speeds = await Promise.all(files.map(async (file,ix,arr) => {
        const shots = await db.shots.where('fileid').equals(file.id).toArray()
        const units = await db.units.where('fileid').equals(file.id).first()
        const velocities = shots.map(s => convvelo(s.velocity,units.velocity,targetunits ));
        speedDatasets.push(
            { 
                label: file.id.toString() + ": " + file.name,
                values: velocities,
                //color: bulmaColorRGBA((ix + 1) /arr.length)
                // take che checksum, shorten it
                color: '#' + file.checksum.toUpperCase().substring(0,6)
            }
        )
    }))
    return speedDatasets
}

/*export function GetFile (fileid: number){
    db.files.get().toArray()
}

export function GetShots (fileid: number) {
    const query = db.query(`select shotnumber, velocity, energy, timestamp from shots where fileid = $fileid`)
    query.all({ $fileid: fileid}) as Shot[]
}

export function GetStats (fileid: number){
    const query = db.query(`select shots_total, speed_avg, speed_max, speed_min, speed_es, projectile, timestamp, timezone from stats where fileid = $fileid`)
    query.get({ $fileid: fileid}) as SessionStats
}


export function GetUnits (fileid: number){
    const query = db.query(`select velocity, distance, energy, weight from units where fileid = $fileid`)
    query.get({ $fileid: fileid}) as SessionUnits
}

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