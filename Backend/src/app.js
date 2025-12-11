import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

import { startTempCleanup } from './utils/cleanup.js';

// scheduled cleanup for temp uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../public/temp');

startTempCleanup(tempDir);

export default app;