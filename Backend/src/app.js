import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
));

app.use(express.json(
    {
        limit: '50mb'
    }
));

app.use(express.urlencoded(
    {
        limit: '50mb',
        extended: true
    }
));
app.use(express.static('public'));

//imports routes
import documentRoute from './routes/documnet.routes.js';

//routes
app.use('/api/v1/documents', documentRoute);


export default app;