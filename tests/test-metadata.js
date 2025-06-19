const FilebaseClient = require('../src/filebase');

/**
 * Instance of the Filebase client configured with your credentials and bucket name.
 * Replace the placeholder values with your actual credentials.
 */
const client = new FilebaseClient({
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  bucketName: 'YOUR_BUCKET',
});

/**
 * The name of the file whose metadata you want to retrieve.
 * This file must exist in the configured bucket.
 */
const fileName = 'YOUR_FILENAME';

/**
 * Retrieves the metadata of a specified file from the Filebase bucket.
 * Checks specifically for the 'cid' metadata field and logs its value if present.
 * Handles errors such as missing files or connection issues.
 */
async function getFileMetadata() {
  try {
    // Request file metadata from the client
    const response = await client.getFileMetadata(fileName);

    // Check if the request was successful
    if (!response.success) {
      throw new Error(`Metadata retrieval error: ${response.error}`);
    }

    const metadata = response.data;

    if (metadata.cid) {
      console.log(`CID metadata for file "${fileName}": ${metadata.cid}`);
    } else {
      console.log(`The file "${fileName}" does not have a 'cid' metadata field.`);
    }
  } catch (error) {
    // Handle errors during metadata retrieval
    console.error(`Error retrieving metadata: ${error.message}`);
  }
}

// Run the metadata retrieval function
getFileMetadata();
