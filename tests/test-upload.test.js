const path = require('path');
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
 * Local path of the PDF file to upload.
 */
const localFilePath = path.join(__dirname, 'YOUR_FILENAME.pdf');

/**
 * The name under which the file will be stored in Filebase.
 */
const fileName = 'YOUR_FILENAME.pdf';

/**
 * Uploads a local file to the configured Filebase bucket.
 * 
 * Logs the URL of the uploaded file upon success.
 * Handles upload errors such as authentication failure or connectivity issues.
 */
async function uploadFile() {
  try {
    const response = await client.uploadFile(localFilePath, fileName);

    if (!response.success) {
      throw new Error(response.error);
    }

    console.log('File uploaded successfully to Filebase.');
    console.log(`File URL: ${response.data.location}`);

  } catch (error) {
    console.error(`Error uploading file: ${error.message}`);
  }
}

// Execute the upload function
uploadFile();
