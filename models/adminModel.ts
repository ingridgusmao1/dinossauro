import { Pool } from 'pg';


const pool = new Pool({
    user: 'ingrid',
    host: 'localhost',
    database: 'dinossauro',
    password: '123',
    port: 5432,
});


