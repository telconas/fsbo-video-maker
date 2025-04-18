// netlify/functions/videos-create.js
export async function handler(event) {
  // Parse incoming data
  const data = JSON.parse(event.body);

  // Placeholder: Store the project info and return an ID
  const projectId = Math.floor(Math.random() * 100000);

  return {
    statusCode: 200,
    body: JSON.stringify({ id: projectId })
  };
}
