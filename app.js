const express = require('express');
const app = express();
const TradingView = require('./main');
const getIndicatorData = require('./functions/GetIndicator');

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1); //mandatory (as per the Node.js docs)
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); //mandatory (as per the Node.js docs)
});

app.get('/:symbol', async (req, res) => {
    try {
        let symbol = req.params.symbol;
        let timeframe = req.query.timeframe || '15';
        let range = parseInt(req.query.range, 10) || 20;

        const data = await getIndicatorData.getMacd(TradingView, symbol, timeframe, range);
        
        res.json({
            success: true,
            symbol: symbol,
            count: data.length,
            symbol: symbol,
            timeframe: timeframe,
            data: data
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'Service unavailable'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});