const TradingView = require('../main');

/*
  This example tests fetching chart
  data of a number of candles before
  or after a timestamp
*/

const client = new TradingView.Client();

const chart = new client.Session.Chart();
chart.setMarket('BINANCE:FTMUSDT', {
  timeframe: '240',
  range: 10, // Can be positive to get before or negative to get after
  // to: Math.round(Date.now() / 1000) - 86400 * 1,
});

// This works with indicators

TradingView.getIndicator('STD;Supertrend').then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(() => {
    console.log('Prices periods:', chart.periods.length);
    // console.log('Study periods:', SUPERTREND.periods);
    client.end();
  });
});
