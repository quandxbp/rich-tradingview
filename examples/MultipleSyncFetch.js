const TradingView = require('../main');

/*
  This examples synchronously
  fetches data from 3 indicators
*/

const client = new TradingView.Client();
const chart = new client.Session.Chart();
chart.setMarket('BINANCE:DYDXUSDT', {
  timeframe: '240',
  range: 2,
});

function getIndicData(indicator) {
  return new Promise((res) => {
    const STD = new chart.Study(indicator);

    console.log(`Getting "${indicator.description}"...`);

    STD.onUpdate(() => {
      res(STD.periods);
      console.log(`"${indicator.description}" done !`);
    });
  });
}

function processIndicatorData(data) {
    let processedData = data.map(x => {
        return {
          'time': x['$time'],
          'macd': x['MACD'],
          'highest': x['highest'],
          'highest_join': x['highestjoin'],
          'lowest': x['lowest'],
          'lowest_join': x['lowestjoin'],
          'divergence_LL': x['divergence_LL'],
          'divergence_HH': x['divergence_HH'],
          'hidden_LL': x['hidden_LL'],
          'hidden_HH': x['hidden_HH'],
        }
    })
    return processedData;
}

(async () => {
  console.log('Getting all indicators...');

  const indicData = await Promise.all([
    await TradingView.getIndicator('PUB;6FqFc5a2HcrkDz73cuXxANgR7A7WfKdU'),
  ].map(getIndicData));

  console.log(processIndicatorData(indicData[0]));
  console.log('All done !');

  client.end();
})();
