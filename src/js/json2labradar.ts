import dayjs from "dayjs";
import { Unit_Velocity,Unit_System,Unit_Distance,Unit_Energy, Unit_Weight, ShotSession, SessionUnits, SessionStats, Shot, FileInfo } from "./_types";
import getLabradartemplate from "./helper/getLabradarTemplate";
import { GetFile, GetShots, GetStats, GetUnits } from "./services/exportService";
import { generateFilename } from "./helper/generateFilename";

function jsonconverter(file:FileInfo,units:SessionUnits,stats:SessionStats,shots:Shot[]){
  let stream = getLabradartemplate();
  stream = stream.replace("{DEVICEID}", file.deviceid ?? "useyournose-xeroconv");
  stream = stream.replace("{SHOTS_TOTAL}",shots.length.toString());
  stream = stream.replaceAll("{UNIT_VELOCITY}", Unit_Velocity[Unit_System[Number(units.velocity)] as keyof typeof Unit_Velocity]);
  stream = stream.replaceAll("{UNIT_DISTANCE}", Unit_Distance[Unit_System[Number(units.distance)] as keyof typeof Unit_Distance]);
  stream = stream.replaceAll("{UNIT_ENERGY}", Unit_Energy[Unit_System[Number(units.energy)] as keyof typeof Unit_Energy]);
  stream = stream.replaceAll("{UNIT_WEIGHT}", Unit_Weight[Unit_System[Number(units.weight)] as keyof typeof Unit_Weight]);
  if (stats.speed_avg) {
    stream = stream.replace("{SPEED_AVG}",stats.speed_avg.toFixed(3).toString());
  }
  if (stats.speed_max) {
    stream = stream.replace("{SPEED_MAX}",stats.speed_max.toString());
  }
  if (stats.speed_min) {
  stream = stream.replace("{SPEED_MIN}",stats.speed_min.toString());
  }
  
  if (stats.speed_es) {
  stream = stream.replace("{SPEED_ES}",stats.speed_es.toString());
  }
  
  if (stats.speed_sd) {
    stream = stream.replace("{SPEED_SD}",stats.speed_sd.toString());
  }
  
  shots.forEach(function (item,index) { 
    //Shot ID;V0;Ke0;Proj. Weight;Date;Time\n`
    stream+=item.shotnumber.toString() +";"+ item.velocity.toString() +";"+ item.energy.toString() + ";" + (stats.projectile?.toString() ?? "") + ";" + dayjs.unix(item.timestamp).format('DD-MM-YYYY') +";" + dayjs.unix(item.timestamp).format('HH:mm:ss')   + ";\n";
  })

  return stream
}

export async function json2Labradar(Session: ShotSession):Promise<File> {
  return new Promise((resolve,reject) => {
    const stream = jsonconverter(Session.file,Session.units,Session.stats,Session.shots)
    const filename = generateFilename(Session.file.name, Session.file.title, Session.stats.timestamp);
    const blob = new Blob([stream], {type: "text/plain;charset=utf-8"} )
    const file = new File([blob], filename, {type: "text/plain"})
    return resolve(file)
  })
}
    
    
    /*
    stream = stream.replace("{DEVICEID}", "useyournose-xeroconv");
        stream = stream.replace("{SHOTS_TOTAL}",shots.data.length.toString().padStart(4, '0'));
        stream = stream.replaceAll("{UNIT_VELOCITY}",unit_velocity);
        stream = stream.replaceAll("{UNIT_DISTANCE}",unit_distance);
        stream = stream.replaceAll("{UNIT_ENERGY}",unit_energy);
        stream = stream.replaceAll("{UNIT_WEIGHT}",unit_weight);
        stream = stream.replace("{SPEED_AVG}",speed_avg.toFixed(3).toString());
        stream = stream.replace("{SPEED_MAX}",speed_max.toString());
        stream = stream.replace("{SPEED_MIN}",speed_min.toString());
        stream = stream.replace("{SPEED_ES}",nnf(stats.data[3][1]).toString());
        stream = stream.replace("{SPEED_SD}",nnf(stats.data[2][1]).toString());
    
        shots.data.forEach(function (item,index) { 
            stream+=item[0].toString().padStart(4, '0') + ";" + nnf(item[1]) +";" + nnf(item[3]) + ";" + nnf(stats.data[4][1]) + ";" + datestring +";" + item[5]  + ";\n";
        })
        console.log("[csv2labradar]: parsed " + title + " in " + (Date.now() - start) + " milliseconds.")
        const downloadstatus:Promise<string|boolean> = download(stream,filename)
        downloadstatus
        .then((value) => {resolve(value.toString())})
        .catch((error) => {console.error(error); reject(error as string); return;})

}*/