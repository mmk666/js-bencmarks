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

const kpi = {
  'ST Rptd $ Growth': ['ST_USD_AMT'],
};

const getKPIValues = (kpi, currency) => {
  switch (kpi) {
    case 'ST Rptd $ Growth':
      return currency === '$' ? ['ST_USD_AMT'] : ['ST_LOC_AMT'];
    case 'ST Rptd YoY Units':
      return ['ST_RPTD_QTY'];
    case 'Quotes':
      return [];
    case 'AC Attach':
      return [];
    case 'POP':
      return ['SOV_POP_SCORE_VA'];
    case 'Attach Access':
      return [];
    case 'ASP':
      return ['ST_USD_AMT', 'ST_RPTD_QTY'];
  }
};
