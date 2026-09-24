const { initAuthCreds, BufferJSON, proto } = require('@whiskeysockets/baileys');
const { Pool } = require('pg');

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon
  });
}

async function usePostgresAuthState() {
  if (!pool) throw new Error("DATABASE_URL is not set");
  
  await pool.query(`CREATE TABLE IF NOT EXISTS whatsapp_auth (id VARCHAR(255) PRIMARY KEY, data TEXT)`);

  const writeData = async (data, id) => {
    try {
      await pool.query('INSERT INTO whatsapp_auth (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data', [id, JSON.stringify(data, BufferJSON.replacer)]);
    } catch (e) {
      console.error(`Error saving ${id}:`, e);
    }
  };

  const readData = async (id) => {
    try {
      const res = await pool.query('SELECT data FROM whatsapp_auth WHERE id = $1', [id]);
      if (res.rows.length > 0) return JSON.parse(res.rows[0].data, BufferJSON.reviver);
    } catch (e) {
      console.error(`Error reading ${id}:`, e);
    }
    return null;
  };

  const removeData = async (id) => {
    try {
      await pool.query('DELETE FROM whatsapp_auth WHERE id = $1', [id]);
    } catch(e) {
      console.error(`Error deleting ${id}:`, e);
    }
  };

  const creds = await readData('creds') || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(ids.map(async id => {
            let value = await readData(`${type}-${id}`);
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          }));
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => writeData(creds, 'creds'),
    pool // export pool for settings
  };
}

module.exports = { usePostgresAuthState, pool };
