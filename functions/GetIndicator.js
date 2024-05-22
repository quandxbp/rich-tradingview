module.exports = {
    async getMacdAdvanced(TradingView, symbol, timeframe='240') {
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
                    console.log(STD.periods);
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

    // Get Basic MACD
    async getMacd(TradingView, symbol, timeframe='15', range=20) {
        const client = new TradingView.Client();
        const chart = new client.Session.Chart();
        chart.setMarket(symbol, {
            timeframe: timeframe,
            range: range,
        });

        function parseData(indicator) {
            return new Promise((res) => {
                const STD = new chart.Study(indicator);

                console.log(`Getting "${symbol}"...`);
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

        function isDoji(data, percentage = 10) {
            let threshold = (data.max - data.min) * (percentage / 100);
            let diff = Math.abs(data.open - data.close);
            return diff <= threshold;
        }

        function isGap(data) {
            if (data.close >= data.max || data.close <= data.min) return false;
            
            upper = data.open > data.close ? data.open : data.close;
            lower = data.open < data.close ? data.open : data.close;

            inside = Math.abs(data.open - data.close);
            outside = Math.abs(data.max - upper) + Math.abs(data.min - lower);
            return inside < outside;
        }

        
        function processIndicatorData(data) {
            let filteredData = data.map(x => {
              return {
                time: x['$time'],
                datetime: new Date(x['$time'] * 1000),
                macd: x['MACD'],
                signal: x['signal'],
                max: x['max'],
                min: x['min'],
                open: x['open'],
                close: x['close'],
                label: x['open'] > x['close'] ? "GREEN" : "RED",
                macd_trend: x['MACD'] > x['signal'] ? "UP" : "DOWN",
                is_doji: isDoji(x),
                is_gap: isGap(x),
              };
            });

            return filteredData;
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