import mock from './mock.json';

const filterobj = {
  region_name: 'Western Europe',
  sub_region_name: 'South Europe',
  country_name: 'Italy',
  rtm_val: 'Consumer - Channel',
  partner_name: 'Italy -Amazon',
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
    case 'Region':
      return { region_name };
    case 'Sub Region':
      return { sub_region_name };
    case 'Country / Geo7':
      return { country_name };
    case 'Region RTM':
      return { region_name, rtm_val };
    case 'Sub Region RTM':
      return { sub_region_name };
    case 'Country / Geo7 RTM':
      return { country_name };
  }
};

const mapWithKey = (arr) => {
  return arr.map((item) => ({ key: 'measure_name', value: item }));
};

const getKpiValues = (kpi, currency) => {
  switch (kpi) {
    case 'ST Rptd $ Growth Rate':
      return mapWithKey(currency === '$' ? ['ST_USD_AMT'] : ['ST_LOC_AMT']);
    case 'ST Rptd YoY Units':
      return mapWithKey(['ST_RPTD_QTY']);
    case 'Quotes - Goal Acheived':
      return mapWithKey([]);
    case 'Apple Care Attach':
      return mapWithKey([]);
    case 'Premium Online Placement':
      return mapWithKey(['SOV_POP_SCORE_VA']);
    case 'Attach Accessories':
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

const getASPValue = (x, y) => {
  const m = Math.round(x);
  const n = Math.round(y);
  if (m === 0 || n === 0) {
    return 0;
  }

  return Math.round(m / n);
};

const getFilteredKpi = (data, [x, y] = [], kpi) => {
  if (y) {
    const arr = data?.filter(
      (item) => item[x?.key] === x?.value || item[y?.key] === y?.value
    );
    if (kpi === 'ASP') {
      const key = x?.key;
      const m = x?.value;
      const n = y?.value;
      const k = arr.reduce((accum, item) => {
        if (item[key] === m) {
          const filterobj = {
            region_name: item?.region_name,
            sub_region_name: item?.sub_region_name,
            country_name: item?.country_name,
            rtm_val: item?.rtm_val,
            partner_name: item?.partner_name,
            [key]: n,
          };
          const obj = arr?.find((item) =>
            Object.keys(filterobj).every((key) => item[key] === filterobj[key])
          );

          const finalObj = {
            ...item,
            C_MEASURE_VAL: getASPValue(item?.C_MEASURE_VAL, obj?.C_MEASURE_VAL),
            PPPY_MEASURE_VAL: getASPValue(
              item?.PPPY_MEASURE_VAL,
              obj?.PPPY_MEASURE_VAL
            ),
            PPY_MEASURE_VAL: getASPValue(
              item?.PPY_MEASURE_VAL,
              obj?.PPY_MEASURE_VAL
            ),
            PY_MEASURE_VAL: getASPValue(
              item?.PY_MEASURE_VAL,
              obj?.PY_MEASURE_VAL
            ),
            P_MEASURE_VAL: getASPValue(item?.P_MEASURE_VAL, obj?.P_MEASURE_VAL),
          };

          accum.push(finalObj);
        }
        return accum;
      }, []);
      return k;
    }
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
    case 'ST Rptd $ Growth Rate':
      return Math.round((C_val / P_val) * 100);
    case 'ST Rptd YoY Units':
      return Math.round((C_val / P_val - 1) * 100);
    case 'Quotes - Goal Acheived':
      return '';
    case 'Apple Care Attach':
      return '';
    case 'Premium Online Placement':
      return C_val;
    case 'Attach Accessories':
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
    case 'ST Rptd $ Growth Rate':
      return Math.round((P_val / PY_val) * 100);
    case 'ST Rptd YoY Units':
      return Math.round((P_val / PY_val - 1) * 100);
    case 'Quotes - Goal Acheived':
      return '-';
    case 'Apple Care Attach':
      return '-';
    case 'Premium Online Placement':
      return Math.round((C_val / P_val - 1) * 100);
    case 'Attach Accessories':
      return '-';
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
    case 'ST Rptd $ Growth Rate':
      return Math.round((X_val / Y_val) * 100);
    case 'ST Rptd YoY Units':
      return Math.round((X_val / Y_val - 1) * 100);
    case 'Quotes - Goal Acheived':
      return '-';
    case 'Apple Care Attach':
      return '-';
    case 'Premium Online Placement':
      return Math.round((C_val / P_val - 1) * 100);
    case 'Attach Accessories':
      return '-';
    case 'ASP':
      return Math.round((C_val / P_val - 1) * 100);
  }
};

const getMaxvalue = (arr, key) => Math.max(...arr.map((o) => o[key]));

const getMinvalue = (arr, key) => Math.min(...arr.map((o) => o[key]));

const getAvgvalue = (arr, key) =>
  Math.round(arr.reduce((p, c) => p + c[key], 0) / arr.length);

const getPartnerCount = (includePartner, categoryWithPartner) => {
  const list = [
    ...new Set(categoryWithPartner.map((item) => item?.partner_name)),
  ];
  return list.length === 0
    ? '0/0'
    : `${includePartner ? list.length : list.length - 1}/${list.length}`;
};

const getFinalObj = (
  arr,
  kpi,
  benchMarkval,
  yearType,
  includePartner,
  categoryWithPartner
) => {
  const percentageData = arr.length === 0 ? [{ value: 0 }] : arr;
  const lower_range = getMinvalue(percentageData, 'value');
  const upper_range = getMaxvalue(percentageData, 'value');
  const average = getAvgvalue(percentageData, 'value');
  const benchmark = Math.round(benchMarkval[0]?.value ?? 0);
  const qoq = getWOW(kpi, benchMarkval);
  const qoq_color = Math.round(qoq) > -1 ? 'green' : 'red';
  const yoy = getYOY(kpi, benchMarkval, yearType);
  const yoy_color = Math.round(yoy) > -1 ? 'green' : 'red';
  const formatter = '%';
  const partners = getPartnerCount(includePartner, categoryWithPartner);
  const bar_color = benchmark < average ? 'red' : 'green';

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

const getKpiData = (
  data,
  kpi,
  includePartner,
  currency,
  filterObj,
  category,
  yearType
) => {
  const kpival = getKpiValues(kpi, currency);
  const filteredKPI = getFilteredKpi(data, kpival, kpi);
  const percentageVal = getPercentageData(filteredKPI, kpi);
  const benchMark = filterArray(percentageVal, filterObj);
  const categoryValues = getCategoryValues(category, filterObj);
  const filteredCategory = getFilteredCategories(
    percentageVal,
    categoryValues,
    includePartner,
    filterObj
  );
  const filteredCategoryWithPartner = getFilteredCategories(
    percentageVal,
    categoryValues,
    false,
    filterObj
  );
  const finalObj = getFinalObj(
    filteredCategory,
    kpi,
    benchMark,
    yearType,
    includePartner,
    filteredCategoryWithPartner
  );
  return finalObj;
};

/**
 * Returns an Array of Objects
 * @param {Array} [data]
 * @param {Array} [kpi]
 * @param {boolean} [includePartner]
 * @param {string} [currency]
 * @param {obj} [filterObj]
 * @param {string} [category]
 * @param {string} [yearType]
 */

export const generateData = (
  data = [],
  kpi = [],
  includePartner,
  currency,
  filterObj,
  category,
  yearType
) => {
  if (data) {
    return kpi?.map((item) =>
      getKpiData(
        data,
        item,
        includePartner,
        currency,
        filterObj,
        category,
        yearType
      )
    );
  }

  return [];
};

const arr = [
  'ST Rptd $ Growth Rate',
  'ST Rptd YoY Units',
  'Quotes - Goal Acheived',
  'Apple Care Attach',
  'Premium Online Placement',
  'Attach Accessories',
  'ASP',
];
console.log(generateData(mock, arr, false, '', filterobj, 'region', 'YoY'));
