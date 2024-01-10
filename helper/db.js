const mariadb = require('mariadb');
const pool = mariadb.createPool({host: "localhost", user: "root",password:"012345678",database:"retex", connectionLimit: 5});

const db = async(qr,data)=> {
  let conn;
  try {

	conn = await pool.getConnection();
	const res = await conn.query(qr, data);
    await conn.release();
    return res


  }catch (e) {
    return e.message
  }
}

module.exports = { db }