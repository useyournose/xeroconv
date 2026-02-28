import { Dexie, Entity, type EntityTable, type DexieOptions } from 'dexie';
import { FileInfoEntry, SessionStatsEntry, SessionUnitsEntry, ShotEntry} from './_types'

// AppDB.ts
export class AppDB extends Dexie {
  name: string = "xeroconv-db"
  files!: EntityTable<FileInfoEntry, 'id'>;
  stats!: EntityTable<SessionStatsEntry>;
  units!: EntityTable<SessionUnitsEntry>;
  shots!: EntityTable<ShotEntry>;
  opts?: {indexedDB?: IDBFactory; IDBKeyRange?: any;}
  constructor(name?: string, options?: DexieOptions) {
    super(name, options);
    this.version(1).stores({
        files: '++id, name, checked, checksum',
        stats: '++, fileid',
        units: '++, fileid',
        shots: '++, fileid, shotnumber'
    });
  }
}

export function createDB(name:string = 'xeroconv-db', options?: DexieOptions): AppDB {
  return new AppDB(name, options)
}


/*export function createXeroConvDB(opts?: { indexedDB?: IDBFactory; IDBKeyRange?: any; name?: string }) {
    const { indexedDB, IDBKeyRange, name = "xeroconv-db" } = opts || {};
    const db = new Dexie(name, { indexedDB, IDBKeyRange });
  
    if (IDBKeyRange) (Dexie as any).dependencies.IDBKeyRange = IDBKeyRange;
  
    db.version(1).stores({
        files: '++id, name',
        stats: '++id, fileid',
        units: '++id, fileid',
        shots: '++id, fileid, shotnumber'
    });

    return db as Dexie & {
        files: EntityTable<FileInfoEntry, 'id'>;
        stats: EntityTable<SessionStatsEntry, 'id'>;
        units: EntityTable<SessionUnitsEntry, 'id'>;
        shots: EntityTable<ShotEntry, 'id'>;
    };
}

// Optional shared singleton (lazy)
let _shared: ReturnType<typeof createXeroConvDB> | null = null;
export function getXeroConvDB() {
  if (!_shared) _shared = createXeroConvDB();
  return _shared;
}*/