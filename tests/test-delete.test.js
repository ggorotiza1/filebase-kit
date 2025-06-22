const FilebaseClient = require('../src/filebase');

/**
 * Instance of the Filebase client.
 * Replace the credentials and bucket name with your actual values.
 */
const client = new FilebaseClient({
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    bucketName: 'YOUR_BUCKET',
});

/**
 * Current name of the file and the desired new name.
 * Make sure the original file exists in the bucket.
 */
const oldFileName = 'EXISTING_FILE.pdf';
const newFileName = 'RENAMED_FILE.pdf';

/**
 * Renames a file in the Filebase bucket.
 * 
 * If the new name already exists, a suffix (1), (2), etc. will be automatically added.
 */
async function renameFileInBucket() {
    try {
        // Attempt to rename the file
        const response = await client.renameFile(oldFileName, newFileName);

        // Check if the operation was successful
        if (!response.success) {
            throw new Error(`Rename error: ${response.error}`);
        }

        console.log(response.message);
    } catch (error) {
        console.error(`Error renaming the file: ${error.message}`);
    }
}

// Execute main function
renameFileInBucket();
