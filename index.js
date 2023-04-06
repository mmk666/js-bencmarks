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

  if (C_val === 0 || P_val === 0) {
    return 0;
  }

  switch (kpi) {
    case 'ST Rptd $ Growth':
      return Math.round((C_val / P_val) * 100);
    case 'ST Rptd YoY Units':
      return Math.round((C_val / P_val - 1) * 100);
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

const getWOW = (kpi, benchMarkval) => {
  const C_val = Math.round(benchMarkval[0]?.C_MEASURE_VAL ?? 0);
  const P_val = Math.round(benchMarkval[0]?.P_MEASURE_VAL ?? 0);
  const PY_val = Math.round(benchMarkval[0]?.PY_MEASURE_VAL ?? 0);

  if (C_val === 0) {
    return '-100%';
  }
  if (P_val === 0 || PY_val === 0) {
    return '-';
  }

  switch (kpi) {
    case 'ST Rptd $ Growth':
      return Math.round((P_val / PY_val) * 100);
    case 'ST Rptd YoY Units':
      return Math.round((P_val / PY_val - 1) * 100);
    case 'Quotes':
      return '';
    case 'AC Attach':
      return '';
    case 'POP':
      return Math.round((C_val / P_val - 1) * 100);
    case 'Attach Access':
      return '';
    case 'ASP':
      return Math.round((C_val / P_val - 1) * 100);
  }
};

const getYOY = (kpi, benchMarkval, yearType) => {
  const C_val = Math.round(benchMarkval[0]?.C_MEASURE_VAL ?? 0);
  const P_val = Math.round(benchMarkval[0]?.P_MEASURE_VAL ?? 0);
  const PY_val = Math.round(benchMarkval[0]?.PY_MEASURE_VAL ?? 0);
  const PPY_val = Math.round(benchMarkval[0]?.PPY_MEASURE_VAL ?? 0);
  const PPPY_val = Math.round(benchMarkval[0]?.PPPY_MEASURE_VAL ?? 0);

  const X_val =
    yearType === 'YOY-3' ? PPY_val : yearType === 'YOY-2' ? PPY_val : PY_val;
  const Y_val =
    yearType === 'YOY-3' ? PPPY_val : yearType === 'YOY-2' ? PPPY_val : PPY_val;

  if (X_val === 0 || C_val === 0) {
    return '-100%';
  }
  if (Y_val === 0 || P_val === 0) {
    return '-';
  }

  switch (kpi) {
    case 'ST Rptd $ Growth':
      return Math.round((X_val / Y_val) * 100);
    case 'ST Rptd YoY Units':
      return Math.round((X_val / Y_val - 1) * 100);
    case 'Quotes':
      return '';
    case 'AC Attach':
      return '';
    case 'POP':
      return Math.round((C_val / P_val - 1) * 100);
    case 'Attach Access':
      return '';
    case 'ASP':
      return Math.round((C_val / P_val - 1) * 100);
  }
};

const getMaxvalue = (arr, key) => Math.max(...arr.map((o) => o[key]));

const getMinvalue = (arr, key) => Math.min(...arr.map((o) => o[key]));

const getAvgvalue = (arr, key) =>
  arr.reduce((p, c) => p + c[key], 0) / arr.length;

const getFinalObj = (arr, kpi, benchMarkval, yearType) => {
  const percentageData = getPercentageData(arr, kpi);
  console.log(percentageData);
  const lower_range = getMinvalue(percentageData, 'value');
  const upper_range = getMaxvalue(percentageData, 'value');
  const average = getAvgvalue(percentageData, 'value');
  const benchmark = benchMarkval[0]?.C_MEASURE_VAL ?? 0;
  const qoq = getWOW(kpi, benchMarkval);
  const qoq_color = Math.round(qoq) > -1 ? 'green' : 'red';
  const yoy = getYOY(kpi, benchMarkval, yearType);
  const yoy_color = Math.round(yoy) > -1 ? 'green' : 'red';
  const formatter = '%';
  const partners = '';
  const bar_color = 'green';

  return {
    kpi,
    value: benchmark,
    benchmark,
    lower_range,
    upper_range,
    average,
    qoq,
    qoq_color,
    yoy,
    yoy_color,
    formatter,
    partners,
    bar_color,
  };
};

/**
 * Returns an Object
 * @param {Array} [data]
 * @param {string} [kpi]
 * @param {boolean} [includePartner]
 * @param {string} [currency]
 * @param {obj} [filterObj]
 * @param {string} [category]
 * @param {string} [yearType]
 */

const generateData = (
  data,
  kpi,
  includePartner,
  currency,
  filterObj,
  category,
  yearType
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
  const finalObj = getFinalObj(filteredCategory, kpi, benchMark, yearType);
  //console.log(filteredCategory, benchMark);
};

console.log(
  generateData(mock, 'ST Rptd YoY Units', true, '', filterobj, 'region', 'YoY')
);
