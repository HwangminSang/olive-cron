import mysql from 'mysql2/promise';

import { dbPoolProp } from '../db/config';

export const dbPool = mysql.createPool(dbPoolProp)
