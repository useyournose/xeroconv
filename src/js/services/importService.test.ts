import "fake-indexeddb/auto";
//import { IDBKeyRange, IDBFactory } from "fake-indexeddb";

import {expect, test, afterEach,beforeEach,  beforeAll, afterAll, describe} from 'bun:test';
//import {nameddb} from '../db'
import { AddFile, AddStats } from './importService';
//import Dexie from "dexie";
import { FileInfoEntry, SessionStats } from '../_types'
import { AppDB, createDB } from "../Appdb";
//import db from "../db";

describe("DB (Dexie + fake-indexeddb)", async () => {
    let db = new AppDB('xeroconv-test', {indexedDB: indexedDB, IDBKeyRange: IDBKeyRange });
    
    afterEach(async () => {
      // Reset state of indexedDB
        indexedDB = new IDBFactory()
        //db = await createDB('xeroconv-test-db', { indexedDB, IDBKeyRange }).open()
        await db.delete().then(async () => await db.open())
    })
    //beforeEach(async () => { await deleteDb(DB_NAME); });
    //afterEach(async () => { await deleteDb(DB_NAME); });


    test('testdb', async () => {
        expect.hasAssertions();
        db.tables.forEach(function (table) {
            console.log("Schema of " + table.name + ": " + JSON.stringify(table.schema));
        })
        expect(db.tables.length).toBe(4)
    });

    test('db isopen', async () => {
        expect.hasAssertions();
        expect(db.isOpen()).toBe(true);
    });

    test('db isopen 2', async () => {
        expect.hasAssertions();
        await db.open()
        .catch(err => {
            console.error(`Open failed: ${err.stack}`);
        });
        console.log("isuffen?" + db.isOpen())
        expect(await db.shots.toArray()).toHaveLength(0);
    });

    test.todo('fileimport', async () => {
        const expected = [{
                    id: 1,
                    name: "chuck anorak",
                    title: "testtitle",
                    deviceid: "lalala",
                    added: 12345678910,
                    exported: 0,
                    checked: 0
                } as FileInfoEntry]
        expect.hasAssertions();
        await AddFile('test123', 'reaaaaly', 'gumbagumbo')
        .then(async () => await db.files.toArray())
        .then((result) => {
            expect(result[0].id).toBe(expected[0].id)
            })
    });

    /*test('addstats', () => {
        const stats:SessionStats = {
            shots_total: 10,
            speed_avg: 1234.36,
            speed_max: 25222.12,
            speed_min: 123,
            speed_es: 6.55,
            speed_sd: 2.3,
            projectile: 158.0,
            timestamp: 1740355215,
            timezone: 3
        }
        AddFile('test123', 'gumbagumbo')
        .then(
            fileid => ({
                console.log(fileid);
                expect(AddStats(fileid, stats)).toBe(1);

        const query = db.query(`select * from stats`)
        console.log(query.all())
    })*/
});