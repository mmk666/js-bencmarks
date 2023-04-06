import mock from './mock.json';

const filterobj = {
  region_name: 'US',
  sub_region_name: 'US',
  country_name: 'USA',
  rtm_val: 'Telco - Channel',
  partner_name: 'USA -AT&T',
};

/**
 * Filters an array of objects using custom predicates.
 *
 * @param  {Array}  array: the array to filter
 * @param  {Object} filters: an object with the filter criteria
 * @return {Array}
 */
const filterArray = (array, filters) => {
  return array?.filter((item) =>
    Object.keys(filters).every((key) => item[key] === filters[key])
  );
};

const getCategoryValues = (
  type,
  { region_name, sub_region_name, country_name, rtm_val }
) => {
  switch (type) {
    case 'region':
      return { region_name };
    case 'subRegion':
      return { sub_region_name };
    case 'country':
      return { country_name };
    case 'regionRtm':
      return { region_name, rtm_val };
    case 'subRegionRtm':
      return { sub_region_name };
    case 'countryRtm':
      return { country_name };
  }
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

const getFilteredCategories = (
  data = [],
  categoryValues = {},
  includePartner = false,
  filterobj = {}
) => {
  const arr = filterArray(data, categoryValues);

  if (!includePartner) {
    return arr?.filter((item) =>
      Object.keys(filterobj).some((key) => item[key] !== filterobj[key])
    );
  }

  return arr;
};

const getFilteredKpi = (data, [x, y] = []) => {
  if (y) {
    return data?.filter(
      (item) => item[x?.key] === x?.value || item[y?.key] === y?.value
    );
  }
  return data?.filter((item) => item[x?.key] === x?.value);
};

const getPercentageval = (item, kpi) => {
  const C_val = Math.round(item?.C_MEASURE_VAL);
  const P_val = Math.round(item?.P_MEASURE_VAL);

  console.log(C_val, P_val);
  switch (kpi) {
    case 'ST Rptd $ Growth':
      return C_val === 0 || P_val === 0 ? 0 : Math.round((C_val / P_val) * 100);
    case 'ST Rptd YoY Units':
      return C_val === 0 || P_val === 0
        ? 0
        : Math.round((C_val / P_val - 1) * 100);
    case 'Quotes':
      return '';
    case 'AC Attach':
      return '';
    case 'POP':
      return C_val;
    case 'Attach Access':
      return '';
    case 'ASP':
      return C_val;
  }
};

const getPercentageData = (arr, kpi) => {
  return arr?.map((item) => ({
    ...item,
    kpi,
    value: getPercentageval(item, kpi),
  }));
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
  const kpival = getKpiValues(kpi, currency);
  const filteredKPI = getFilteredKpi(data, kpival);
  const benchMark = filterArray(filteredKPI, filterObj);
  const categoryValues = getCategoryValues(category, filterObj);
  const filteredCategory = getFilteredCategories(
    filteredKPI,
    categoryValues,
    includePartner,
    filterObj
  );
  const percentageData = getPercentageData(filteredCategory, kpi);
  console.log(percentageData, benchMark);
};

console.log(
  generateData(mock, 'ST Rptd YoY Units', true, '', filterobj, 'region')
);
