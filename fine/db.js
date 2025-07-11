import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'bt6xgia3bnzwfdyespbt-mysql.services.clever-cloud.com',
  user: 'uq1whvz31vqvgnz9',
  password: 'W6gllDkD0F9h0BdRPJ5H', 
  database: 'escuela',
});