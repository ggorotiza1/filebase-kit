const fs = require('fs');
const path = require('path');
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
 * The name of the file to be downloaded from the bucket.
 * Must exist in the configured bucket.
 */
const fileName = 'informe.pdf';

/**
 * Downloads a file from the Filebase bucket and saves it locally.
 * The file content is received encoded in base64, then decoded and written to disk.
 * 
 * Handles connection, authentication, or file-not-found errors.
 */
async function downloadAndSaveFile() {
  try {
    // Request the file from the Filebase client
    const response = await client.getFile(fileName);

    // Check if the response was successful
    if (!response.success) {
      throw new Error(`Download error: ${response.error}`);
    }

    // Extract and decode the received base64 content
    const { fileContentBase64 } = response.data;
    const fileBuffer = Buffer.from(fileContentBase64, 'base64');

    // Define the local path where the file will be saved
    const outputPath = path.join(__dirname, fileName);

    // Write the file to the filesystem
    fs.writeFileSync(outputPath, fileBuffer);

    console.log(`File "${fileName}" downloaded and saved successfully at: ${outputPath}`);

  } catch (error) {
    // Error handling for any step of the process
    console.error(`Error downloading or saving the file: ${error.message}`);
  }
}

// Run the main function
downloadAndSaveFile();
