const express = require('express');
const app = express();
const TradingView = require('./main');
const getIndicatorData = require('./functions/GetIndicator');

app.get('/:symbol', async (req, res) => {
    try {
        // let symbol = 'BINANCE:OPUSDT';
        let symbol = req.params.symbol;
        let timeframe = '15';
        const data = await getIndicatorData.getMacd(TradingView, symbol, timeframe);
        res.json({
            success: true,
            symbol: symbol,
            count: data.length,
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