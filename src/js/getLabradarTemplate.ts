function getLabradartemplate():string {
    /*just replace the following valiables
    {DEVICEID}
    {SHOTS_TOTAL}
    {UNIT_VELOCITY}
    {UNIT_DISTANCE}
    {UNIT_ENERGY}
    {UNIT_WEIGHT}
    {SPEED_AVG}
    {SPEED_MAX}
    {SPEED_MIN}
    {SPEED_ES}
    {SPEED_SD}
    */
    return `sep=;
Device ID;{DEVICEID};;

Series No;0001;;
Total number of shots;{SHOTS_TOTAL};;

Units velocity;{UNIT_VELOCITY};;
Units distances;{UNIT_DISTANCE};;
Units kinetic energy;{UNIT_ENERGY};;
Units weight;{UNIT_WEIGHT};;

Stats - Average;{SPEED_AVG};{UNIT_VELOCITY};
Stats - Highest;{SPEED_MAX};{UNIT_VELOCITY};
Stats - Lowest;{SPEED_MIN};{UNIT_VELOCITY};
Stats - Ext. Spread;{SPEED_ES};{UNIT_VELOCITY};
Stats - Std. Dev;{SPEED_SD};{UNIT_VELOCITY};

Shot ID;V0;Ke0;Proj. Weight;Date;Time\n`
  };

export default getLabradartemplate;