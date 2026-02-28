import fit2json from "./fit2json"
import xls2json from "./xls2json";
import download from "./downloadhandler";
import { showError } from "./messages";
import csv2json from "./csv2json";
import { AddSession } from "./services/importService"; 
import { json2Labradar } from "./json2labradar";
import { renderTable } from "./renderTable";
import { ShotSession } from "./_types";

async function fileSystemHandleToArrayBuffer(fileHandle: FileSystemFileHandle):Promise<ArrayBuffer> {
  // Get the file from the file handle
  const file = await fileHandle.getFile();

  // Read the file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  return arrayBuffer;
}

function fileToArrayBuffer(file:File):Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
      
    reader.readAsArrayBuffer(file); 
  })
}

export async function handleFiles(files:readonly FileSystemFileHandle[] | FileList | File[], indexedDBavailable:boolean ):Promise<boolean> {
  return new Promise(async (resolve,reject) => {
    var localstoragecount = Number(localStorage.total) || 0
    var outfiles:File[] = []
    var outpromises:Promise<boolean|string|number>[] = []

    async function handleFile (file:FileSystemHandle | File):Promise<boolean > {
        var fileData = new ArrayBuffer()
        if (file instanceof FileSystemFileHandle) {
            fileData = await fileSystemHandleToArrayBuffer(file)
        } else if (file instanceof File) {
            fileData = await fileToArrayBuffer(file)
        } else {
            return Promise.reject(false)
        }
        if (/\.fit$/g.test(file.name)) {
            return fit2json(fileData, file.name)
                .then(async (Session) => {
                    if (indexedDBavailable) {const fid = await AddSession(Session as ShotSession).catch(err => showError(err))}
                    return json2Labradar(Session as ShotSession)
                    }
                )                
                .then((blob) => {outfiles.push(blob);return Promise.resolve(true)})
        } else if (/\.csv$/g.test(file.name)) {
            return csv2json(fileData, file.name)
                .then(async (Session) => {
                    if (indexedDBavailable) {const fid = await AddSession(Session as ShotSession).catch(err => showError(err))}
                    return json2Labradar(Session as ShotSession)
                    }
                )                
                .then((blob) => {outfiles.push(blob);return Promise.resolve(true)})
        } else if (/\.xlsx?$/g.test(file.name)) {
            return xls2json(fileData, file.name)
                .then(sessions => Promise.all(sessions.map(async session => {
                    if (indexedDBavailable) {const fid = await AddSession(session as ShotSession)}
                    return json2Labradar(session)
                    }
                )))
                .then(blobs => outfiles = [...outfiles,...blobs])
                .then(() => {return Promise.resolve(true)})
        } else {
            console.error('[handlefiles]: what is ' + file.name + ' doing here?');
            return Promise.reject(false)
        }
    }
    
    for (const file of files) {
        outpromises.push(handleFile(file))
    }

    await Promise.allSettled(outpromises)
        .then((values) => {
            values.filter((value) => value.status=='rejected').map((value) => showError(value.reason));
            if (outfiles.length === 0) {
                console.log("nothing here")
            }
            else {
                download(outfiles)}
            }
        )
        .then((result) => {
            console.log(result)
            localstoragecount += outfiles.length
            localStorage.total = localstoragecount
            outpromises.length=0;
            if (indexedDBavailable){renderTable();}
            console.log("total converted Files: ", localstoragecount)
            return resolve(true)
        })
        .catch((err) => {
            console.warn(err)
            showError(err);
            return reject(false)
        })
  })
}