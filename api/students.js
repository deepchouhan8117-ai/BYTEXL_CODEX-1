const { createClient } = require('@supabase/supabase-js');

const TABLE_NAME = process.env.SUPABASE_TABLE || 'student_datasets';
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

function withCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  withCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!supabase) {
    sendJson(res, 503, {
      success: false,
      message: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel for this project.',
    });
    return;
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      const latest = Array.isArray(data) && data.length > 0 ? data[0] : null;
      sendJson(res, 200, {
        success: true,
        data: latest ? latest.payload : [],
        payload: latest ? latest.payload : [],
        datasetName: latest ? latest.dataset_name : 'default',
      });
      return;
    }

    if (req.method === 'POST') {
      const body = await parseRequestBody(req);
      const payload = Array.isArray(body.data) ? body.data : Array.isArray(body.payload) ? body.payload : [];
      const datasetName = body.datasetName || 'default';

      if (!Array.isArray(payload) || payload.length === 0) {
        sendJson(res, 400, {
          success: false,
          message: 'A valid dataset array is required.',
        });
        return;
      }

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .upsert(
          {
            dataset_name: datasetName,
            row_count: payload.length,
            payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'dataset_name' }
        )
        .select();

      if (error) {
        throw error;
      }

      sendJson(res, 200, {
        success: true,
        message: 'Dataset saved successfully.',
        data: data?.[0] ?? null,
      });
      return;
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from(TABLE_NAME).delete().neq('dataset_name', '');
      if (error) {
        throw error;
      }

      sendJson(res, 200, {
        success: true,
        message: 'All dataset rows were cleared from the backend.',
      });
      return;
    }

    sendJson(res, 405, {
      success: false,
      message: 'Unsupported HTTP method.',
    });
  } catch (error) {
    console.error('students-api-error', error);
    sendJson(res, 500, {
      success: false,
      message: error.message || 'Internal server error.',
    });
  }
};
