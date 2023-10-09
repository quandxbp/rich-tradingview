module.exports = {
    async getIndicatorData(TradingView, symbol, timeframe='240') {
        const client = new TradingView.Client();
        const chart = new client.Session.Chart();
        chart.setMarket(symbol, {
            timeframe: timeframe,
            range: 50,
            // to: 1694044800,
        });

        function parseData(indicator) {
            return new Promise((res) => {
                const STD = new chart.Study(indicator);

                console.log(`Getting "${indicator.description}"...`);
                STD.onUpdate(() => {
                    let result = [];
                    for (let i = 0; i < chart.periods.length; i++) {
                        let mergedObject = { ...STD.periods[i], ...chart.periods[i] };
                        result.push(mergedObject);
                    }
                    res(result);
                    console.log(`"${indicator.description}" done !`);
                });
            });
        }

        function processIndicatorData(data) {
            const infValue = 1e+100;
            const propsToCheck = [
                'highest', 'highest_join', 
                'lowest', 'lowest_join', 
                'divergence_LL', 'divergence_HH', 
                'hidden_LL', 'hidden_HH'];
            let filteredData = data.map(x => {
              return {
                time: x['$time'],
                datetime: new Date(x['$time'] * 1000),
                macd: x['MACD'],
                highest: x['highest'],
                highest_join: x['highestjoin'],
                lowest: x['lowest'],
                lowest_join: x['lowestjoin'],
                divergence_LL: x['divergence_LL'],
                divergence_HH: x['divergence_HH'],
                hidden_LL: x['hidden_LL'],
                hidden_HH: x['hidden_HH'],
                max: x['max'],
                min: x['min'],
                open: x['open'],
                close: x['close'],
              };
            }).filter(x => {
              return propsToCheck.some(prop => x[prop] !== infValue);
            });

            return filteredData.map(record => {
                for (const key in record) {
                    if (!['time', 'datetime', 'macd', 'webtime', 'max', 'min', 'open', 'close'].includes(key) && record[key] != infValue) {
                        record['scope'] = key;
                        break;
                    }
                }
                return record;
            });
        }

        try {
            console.log('Getting all indicators...');

            const indicData = await Promise.all([
                await TradingView.getIndicator('PUB;6FqFc5a2HcrkDz73cuXxANgR7A7WfKdU'),
            ].map(parseData));

            let processedData = processIndicatorData(indicData[0]);

            console.log('All done !');

            client.end();

            return processedData;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get indicator data');
        }
    },
}