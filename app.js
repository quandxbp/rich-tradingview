const express = require('express');
const app = express();
const TradingView = require('./main');
const getIndicatorData = require('./functions/GetIndicator');

app.get('/', async (req, res) => {
    try {
        const data = await getIndicatorData.getIndicatorData(TradingView);
        res.json(data);
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