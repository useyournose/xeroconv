import dayjs from 'dayjs' ;
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
//import 'dayjs/locale/en';  //English,
import 'dayjs/locale/da'; // Danish,
import 'dayjs/locale/nl'; // Dutch,
import 'dayjs/locale/fr'; // French,
import 'dayjs/locale/de'; // German,
import 'dayjs/locale/it'; // Italian,
import 'dayjs/locale/pl'; // Polish,
import 'dayjs/locale/ro'; // Romanian,
import 'dayjs/locale/es'; // Spanish,
import 'dayjs/locale/sv'; // Swedish,
import 'dayjs/locale/tr'; // Turkish

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);

function monthsToLower(months:string[]):string[] {
    return months.map(name => name.toLowerCase()) ;
}

export default function getdatestring(datestring:string):string[] {
    const culturearray = ["tr","sv","es","ro","pl","it","de","fr","nl","da","en"]
    const STRING_US = 'MMMM D[,]YYYY [at] h:mm A'
    const STRING_EU = 'MMMM DD[,]YYYY HH:mm'
    let cultures:string[]

    // make it a nice string
    if (typeof datestring == "string") {
        datestring = datestring.replace(/\u202f/g,' ');
        if (/[AP]M$/.test(datestring)) {datestring = datestring.replace(' at','')}
    }

    console.debug("[_getdatestring]: trying to convert: "+ datestring);

    
    let culture = 'en'
    let validconversion = false
    let datedate = dayjs("1990-01-01")
    let phase = 0

    if (dayjs(datestring).isValid()) {
        validconversion = true
    }

    if (validconversion === false) {
        //make it lowercase so the months will fetch it
        datestring = datestring.toLowerCase();

            
        // try it the easy way
        phase = 1
        cultures = culturearray.slice(0)

        while (validconversion === false && cultures.length > 0) {
            culture = cultures.pop()
            dayjs.locale(culture)

            //validate culture
            //console.log("supposed culture: " + culture)
            //console.log("current culture: " + dayjs.locale());
            if (culture !== dayjs.locale()) {
                console.warn("[_getdatestring]: Culture " + culture + " missing.");
            }

            // make all monthname lowercase
            //console.log(dayjs.months());
            dayjs.updateLocale(culture,{months: monthsToLower(dayjs.months())})
            //console.log(dayjs.months());

            validconversion = dayjs(datestring).isValid()
            if (validconversion) {
                console.debug("[_getdatestring]: phase 1 conversion worked with "+ dayjs.locale() + " and " + dayjs(datestring).format("DD-MM-YYYY") + ".")
            /*} else {
                console.log("default conversion didn't work "+ dayjs.locale() + ".")
            */}
        }
    }

    // go creative
    if (validconversion == false) {
        phase = 2
        cultures = culturearray.slice(0)
        while (validconversion == false && cultures.length > 0) {
            culture = cultures.pop()
            //console.log(culture)
            validconversion = dayjs(datestring, [STRING_US, STRING_EU], culture).isValid()
            if (validconversion) {
              console.debug("[_getdatestring]: phase 2 conversion worked with " + culture)
            }
        }
    }
    
    if (validconversion === true && phase in [0,1]) {
        // convert it
        datedate = dayjs(datestring)
    }
    else if (validconversion === true && phase == 2) {
        // convert it
        datedate = dayjs(datestring, [STRING_US, STRING_EU], culture)
    } else {
        console.warn("[_getdatestring]: No conversion found for " + datestring);
    }
    
    //return it
    //return [datedate.getDate().toString().padStart(2,'0') + "-" + (datedate.getMonth()+1).toString().padStart(2,'0') + "-" + datedate.getFullYear(),datedate.getHours().toString().padStart(2,'0') + "-" + datedate.getMinutes().toString().padStart(2,'0') + "-" + datedate.getSeconds().toString().padStart(2,'0')];
    //const datestring = item.timestamp.getDate().toString().padStart(2,'0') + "-" + (item.timestamp.getMonth()+1).toString().padStart(2,'0') + "-" + item.timestamp.getFullYear() 
    //const timestring = item.timestamp.getHours().toString().padStart(2,'0') + ":" + item.timestamp.getMinutes().toString().padStart(2,'0')+ ":" + item.timestamp.getSeconds().toString().padStart(2,'0')
    console.debug("[_getdatestring]: conversion done with " + culture + " to " + datedate.format("DD-MM-YYYY") + " " + datedate.format("HH:mm:ss"))
    dayjs.locale('en');
    return [
        datedate.format("DD-MM-YYYY"),
        datedate.format("HH:mm:ss")
    ]
}