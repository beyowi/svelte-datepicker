import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData.js';
import minMax from 'dayjs/plugin/minMax.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import 'dayjs/locale/fr-ca';

dayjs.extend(localeData);
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('fr-ca');

export { dayjs };
