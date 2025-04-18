// netlify/functions/photos-delete.js
export async function handler(event) {
  const photoId = event.path.split("/").pop();

  console.log(`Photo deleted: ${photoId}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ deleted: true })
  };
}
