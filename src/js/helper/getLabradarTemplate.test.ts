import {expect, test} from '@jest/globals';
import getLabradartemplate from './getLabradarTemplate';
const expectation=`sep=;
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

test('Labradartemplate shuold be good', () => {
  expect(getLabradartemplate()).toBe(expectation);
});