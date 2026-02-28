//found  here https://github.com/christianliebel/paint/blob/6b4703cabfb818683c348c212651923a282d3aab/types/static.d.ts#L8

/*type UserChoice = Promise<{
  outcome: 'accepted' | 'dismissed';
  platform: string;
}>;

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: UserChoice;
    prompt(): () => UserChoice
}
  
export interface LaunchParams {
readonly targetURL?: string | null;
readonly files: readonly FileSystemFileHandle[];
}

export type LaunchConsumer = (params: LaunchParams) => any;

export interface LaunchQueue {
setConsumer(consumer: LaunchConsumer): void;
}

declare global {
    interface Window {
        readonly launchQueue: LaunchQueue;
    }
  
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
        appinstalled: Event;
    }
}
*/
// units
export type unitsystems = 'metric'|'imperial'

export const Unit_System : unitsystems[] = ['metric','imperial']

export enum Unit_Velocity {
    metric = 'm/s',
    imperial = 'fps'
}

export enum Unit_Distance {
    metric = 'm',
    imperial = 'yrds'
} 

export enum Unit_Energy {
    metric = 'j',
    imperial = 'ft-lbs'
}

export enum Unit_Weight {
    metric = 'grains (grs)',
    imperial = 'gram (g)'
}

// database

type BaseEntry = {
    id?: number
}

type FileId = {
    fileid: number
}

type Timestamp = {
    timestamp?: number
}

type ShotCount = {
    shotcount?: number
}

export type FileInfo = {
    name: string,
    title: string,
    deviceid: string,
    checksum?: string
}

export type Shot = {
    shotnumber: number,
    velocity: number,
    energy: number,
    timestamp: number
}

export type SessionStats = {
  shots_total: number, // integer
  speed_avg: number, // decimal
  speed_max: number, //decimal
  speed_min: number, // decimal
  speed_es: number, // decimal
  speed_sd: number, //decimal
  projectile: number, //decimal
  timestamp: number, //integer
  timezone: number //integer
}

export type SessionUnits = {
    velocity: boolean,
    distance: boolean,
    energy: boolean,
    weight: boolean
}

export type ShotSession = {
    file: FileInfo,
    stats: SessionStats,
    units: SessionUnits,
    shots: Shot[]
}

//interface FileInfoEntry extends BaseEntry, FileInfo { }

type FileEntry = {
    added: number,
    exported: number,
    checked?: number
}

//export type FileInfoEntry = FileInfo
export type FileInfoEntry = BaseEntry & FileInfo & FileEntry
export type TFileInfoEntry = FileInfoEntry & {stats?: SessionStats}
export type ShotEntry = FileId & Shot
//export type ShotEntry = BaseEntry & FShot
export type SessionStatsEntry = FileId & SessionStats
//export type SessionStatsEntry = BaseEntry & FSessionStats
export type SessionUnitsEntry = FileId & SessionUnits
//export type SessionUnitsEntry = BaseEntry & FSessionUnits

// histogram

export type HistogramDatasetBinned = { label: string; data: number[]; color: string };
export type RawDataset = { label: string; values: number[]; color: string };
export type BinnedDataset = { label: string; data: number[]; color: string };
export type BinningResult = { labels: string[]; edges: number[]; datasets: BinnedDataset[] };

export const allowedFileTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ant.fit"
    ]

export const allowedFileExtensions = [
        "csv",
        "xls",
        "xlsx",
        "fit"
    ]
