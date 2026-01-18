export default async (req) => {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'Functions are working!',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
