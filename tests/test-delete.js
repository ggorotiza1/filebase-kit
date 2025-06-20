const FilebaseClient = require('../src/filebase');

/**
 * Instance of the Filebase client for interacting with the S3-compatible bucket.
 * Replace the credentials and bucket name with your actual data.
 */
const client = new FilebaseClient({
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  bucketName: 'YOUR_BUCKET',
});

/**
 * The name of the file to delete from the Filebase bucket.
 * This file must exist in the bucket to be deleted successfully.
 */
const fileName = 'YOUR_FILENAME.pdf';

/**
 * Deletes a file from the Filebase bucket.
 * 
 * Handles errors such as missing files, permission issues, or connectivity problems.
 */
async function deleteFileFromBucket() {
  try {
    // Attempt to delete the file
    const response = await client.deleteFile(fileName);

    // Check if the operation was successful
    if (!response.success) {
      throw new Error(`Delete error: ${response.error}`);
    }

    console.log(`Archivo "${fileName}" eliminado correctamente del bucket.`);
  } catch (error) {
    console.error(`Error al eliminar el archivo: ${error.message}`);
  }
}

// Ejecutar función principal
deleteFileFromBucket();
