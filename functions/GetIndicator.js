module.exports = {
    async getIndicatorData(TradingView) {
        const client = new TradingView.Client();
        const chart = new client.Session.Chart();
        chart.setMarket('BINANCE:FTMUSDT', {
            timeframe: '240',
            range: 1,
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
            const infValue = 1e+100;
            const propsToCheck = [
                'highest', 'highest_join', 
                'lowest', 'lowest_join', 
                'divergence_LL', 'divergence_HH', 
                'hidden_LL', 'hidden_HH'];
            let filteredData = data.map(x => {
              return {
                time: x['$time'],
                macd: x['MACD'],
                highest: x['highest'],
                highest_join: x['highestjoin'],
                lowest: x['lowest'],
                lowest_join: x['lowestjoin'],
                divergence_LL: x['divergence_LL'],
                divergence_HH: x['divergence_HH'],
                hidden_LL: x['hidden_LL'],
                hidden_HH: x['hidden_HH'],
              };
            }).filter(x => {
              return propsToCheck.some(prop => x[prop] !== infValue);
            });

            return filteredData.map(record => {
                for (const key in record) {
                    if (!['time', 'macd'].includes(key) && record[key] != infValue) {
                        record['value'] = record[key];
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
            ].map(getIndicData));

            let processedData = processIndicatorData(indicData[0]);
            
            // console.log(processedData);
            console.log('All done !');

            client.end();

            return processedData;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get indicator data');
        }
    }
}