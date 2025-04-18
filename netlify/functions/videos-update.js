// netlify/functions/videos-update.js
export async function handler(event) {
  const projectId = event.queryStringParameters.id;
  const data = JSON.parse(event.body);

  console.log(`Updating project ${projectId}`, data);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}
