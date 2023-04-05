import mock from './mock.json';

const filterobj = {
  region_name: 'Japan',
  sub_region_name: 'Japan',
  country_name: 'Japan',
  rtm_val: 'Consumer - Channel',
  partner_name: 'Japan -Amazon',
};

const categories = {
  region: ['region_name'],
  subRegion: ['sub_region_name'],
  country: ['country_name'],
  regionRtm: ['region_name', 'rtm_val'],
  subRegionRtm: ['region_name', 'rtm_val'],
  countryRtm: ['country_name', 'rtm_val'],
};

const mapWithKey = (arr) => {
  return arr.map((item) => ({ key: 'measure_name', value: item }));
};

const getKpiValues = (kpi, currency) => {
  switch (kpi) {
    case 'ST Rptd $ Growth':
      return mapWithKey(currency === '$' ? ['ST_USD_AMT'] : ['ST_LOC_AMT']);
    case 'ST Rptd YoY Units':
      return mapWithKey(['ST_RPTD_QTY']);
    case 'Quotes':
      return mapWithKey([]);
    case 'AC Attach':
      return mapWithKey([]);
    case 'POP':
      return mapWithKey(['SOV_POP_SCORE_VA']);
    case 'Attach Access':
      return mapWithKey([]);
    case 'ASP':
      return mapWithKey(['ST_USD_AMT', 'ST_RPTD_QTY']);
  }
};

const getFilteredCategories = (data, [x, y] = []) => {
  if (y) {
    return data?.filter(
      (item) =>
        (x ? item[x?.key] === x?.value : true) &&
        (y ? item[y?.key] === y?.value : true)
    );
  }
  return data?.filter((item) => (x ? item[x?.key] === x?.value : true));
};

const getFilteredKpi = (data, [x, y] = []) => {
  if (y) {
    return data?.filter(
      (item) => item[x?.key] === x?.value || item[y?.key] === y?.value
    );
  }
  return data?.filter((item) => item[x?.key] === x?.value);
};

/**
 * Returns an Object
 * @param {Array} [data]
 * @param {string} [kpi]
 * @param {boolean} [includePartner]
 * @param {string} [currency]
 * @param {obj} [filterObj]
 * @param {string} [category]
 */

const generateData = (
  data,
  kpi,
  includePartner,
  currency,
  filterObj,
  category
) => {
  const kpival = getKpiValues(kpi);
  const filteredKPI = getFilteredKpi(data, kpival);
  const filteredCategory = getFilteredCategories(filteredKPI, category);
  console.log(filteredKPI);
};

console.log(
  generateData(mock, 'ST Rptd YoY Units', true, '', filterobj, 'region')
);
