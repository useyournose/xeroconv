import dayjs from 'dayjs' ;

export default function getdatestring(datestring) {
    const STRING_US = 'MMMM D[,]YYYY [at] h:mm A'
    const STRING_EU = 'MMMM DD[,]YYYY HH:mm'
    // make it a nice string
    if (typeof datestring == "string") {
        datestring = datestring.replace(/\u202f/g,' ');
        if (/[AP]M$/.test(datestring)) {datestring = datestring.replace(' at','')}
    }
    // convert it
    const datedate = dayjs(datestring).isValid() ? dayjs(datestring) : dayjs(datestring, [STRING_US, STRING_EU])
    
    //return it
    //return [datedate.getDate().toString().padStart(2,'0') + "-" + (datedate.getMonth()+1).toString().padStart(2,'0') + "-" + datedate.getFullYear(),datedate.getHours().toString().padStart(2,'0') + "-" + datedate.getMinutes().toString().padStart(2,'0') + "-" + datedate.getSeconds().toString().padStart(2,'0')];
    //const datestring = item.timestamp.getDate().toString().padStart(2,'0') + "-" + (item.timestamp.getMonth()+1).toString().padStart(2,'0') + "-" + item.timestamp.getFullYear() 
    //const timestring = item.timestamp.getHours().toString().padStart(2,'0') + ":" + item.timestamp.getMinutes().toString().padStart(2,'0')+ ":" + item.timestamp.getSeconds().toString().padStart(2,'0')
    return [
        datedate.format("DD-MM-YYYY"),
        datedate.format("HH:mm:ss")
    ]
}