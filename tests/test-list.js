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
 * Lists the files stored in the configured Filebase bucket and logs their details.
 * 
 * Handles errors such as connection issues or authentication failures.
 */
async function listBucketFiles() {
  try {
    // Request the list of files from the client
    const response = await client.listFiles();

    // Verify if the request was successful
    if (!response.success) {
      throw new Error(`Listing error: ${response.error}`);
    }

    const objects = response.data;

    if (objects.length === 0) {
      console.log(`No objects found in the bucket "${client.bucketName}".`);
    } else {
      console.log(`Objects found in the bucket "${client.bucketName}":\n`);
      objects.forEach((obj, index) => {
        console.log(`${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
      });
    }
  } catch (error) {
    // Handle any errors during the process
    console.error(`Error listing objects: ${error.message}`);
  }
}

// Run the listing function
listBucketFiles();
