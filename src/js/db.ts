import {AppDB} from './Appdb';
import Dexie, { DexieOptions } from 'dexie';

const db = new AppDB();
/*export async function nameddb(name: string, indexedDB?: DexieOptions["indexedDB"], IDBKeyRange?: DexieOptions["IDBKeyRange"]):Promise<Dexie> {
    return new AppDB(name, indexedDB, IDBKeyRange)
}*/

export default db;