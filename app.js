const express = require('express');
const app = express();
const TradingView = require('./main');
const getIndicatorData = require('./functions/GetIndicator');

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
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});