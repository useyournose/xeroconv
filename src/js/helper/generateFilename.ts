import dayjs from "dayjs";

export function generateFilename(filename: string, title?:string, timestamp: number = 1):string {
    const filedate = dayjs.unix(timestamp)
    const datestring = filedate.format("DD-MM-YYYY")
    const hourstring = filedate.format("HH:mm:ss")
    if (/.fit$/.test(filename)) {
        return filename.replace(/\.fit$/,'-xeroconv.csv')
    }

    if (title && title != filename) {
        filename = title + ".csv"
    }

    if (filename.includes(datestring) || filename.includes((datestring.split('-').reverse().join('-'))) ) {
        return filename.replace(/\.csv$/, '-xeroconv.csv');
    } else {
        return filename.replace(/\.csv$/,'')+'_'+datestring + '_' + hourstring.replaceAll(':','-') + '-xeroconv.csv'
    }
}