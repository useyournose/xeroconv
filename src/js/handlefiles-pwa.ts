import fit2labradar from "./fit2labradar";
import csv2labradar from "./csv2labradar";
//import xls2labradar from "./xls2labradar";
import xls2labradar from "./xls2labradar_v2";
import { showError } from "./messages";

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

export async function handleFilesPwa(files:readonly FileSystemFileHandle[] | FileList) {
    var closeonend = false
    var localstoragecount = Number(localStorage.total) || 0
    if (files[0] instanceof FileSystemFileHandle) {
        closeonend = true
    }
    for (const file of files) {
        var fileData = new ArrayBuffer()
        if (file instanceof FileSystemFileHandle) {
            fileData = await fileSystemHandleToArrayBuffer(file)
        } else if (file instanceof File) {
            fileData = await fileToArrayBuffer(file)
        } else {
            return console.log("what is this?")
        }
        if (/\.fit$/g.test(file.name)) {
            const result_f:Promise<string> = fit2labradar(fileData, file.name)
            result_f.then((value) => {console.log("[handlefiles2]: success");localstoragecount += 1;},(error) => {showError(error)});
        } else if (/\.csv$/g.test(file.name)) {
            const result_c:Promise<string> = csv2labradar(fileData, file.name);
            result_c.then((value) => {console.log("[handlefiles2]: success");localstoragecount += 1},(error) => {showError(error)});
        } else if (/\.xlsx?$/g.test(file.name)) {
            const result_x:Promise<string> = xls2labradar(fileData, file.name);
            result_x.then((value) => {console.log("[handlefiles2]: success");localstoragecount += 1},(error) => {showError(error)});
        } else {
            console.error('[handlefiles]: what is ' + file.name + ' doing here?');
        }
    }
    // update local storage
    localStorage.total = localstoragecount
    console.log("total converted Files: ", localstoragecount)
    
    if (closeonend === true) {
        window.close()
    }
}