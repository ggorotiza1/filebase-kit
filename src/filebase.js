const AWS = require('aws-sdk');
const fs = require('fs');

class FilebaseClient {
  /**
   * Creates an instance of FilebaseClient.
   * @param {object} config - Configuration object.
   * @param {string} config.accessKeyId - Access key ID for Filebase.
   * @param {string} config.secretAccessKey - Secret access key for Filebase.
   * @param {string} config.bucketName - Name of the S3 bucket.
   */
  constructor({ accessKeyId, secretAccessKey, bucketName }) {
    this.bucketName = bucketName;
    this.s3 = new AWS.S3({
      endpoint: 'https://s3.filebase.com',
      accessKeyId,
      secretAccessKey,
      region: 'us-east-1',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  /**
   * Uploads a file to the Filebase bucket.
   * @param {string} filePath - Local path of the file to upload.
   * @param {string} fileName - The key (name) under which to store the file in the bucket.
   * @param {object} [metadata={}] - Optional metadata to attach to the file.
   * @returns {Promise<object>} A promise resolving to an object with success status and either the uploaded file URL or error message.
   */
  async uploadFile(filePath, fileName, metadata = {}) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: 'application/pdf',
        Metadata: metadata,
      };

      const data = await this.s3.upload(params).promise();
      return { success: true, data: { location: data.Location } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieves the contents of a file from the Filebase bucket.
   * @param {string} fileName - The key (name) of the file in the bucket.
   * @returns {Promise<object>} A promise resolving to an object with success status and either the file content encoded in base64 or an error message.
   */
  async getFile(fileName) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
      };
      const data = await this.s3.getObject(params).promise();
      // Return the file content encoded in base64 for easier JSON handling
      return { success: true, data: { fileContentBase64: data.Body.toString('base64') } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieves the metadata of a file stored in the bucket.
   * @param {string} fileName - The key (name) of the file in the bucket.
   * @returns {Promise<object>} A promise resolving to an object with success status and either the metadata object or an error message.
   */
  async getFileMetadata(fileName) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
      };
      const data = await this.s3.headObject(params).promise();
      return { success: true, data: data.Metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Lists files stored in the configured Filebase bucket.
   * @returns {Promise<object>} A promise resolving to an object with success status and either the list of files or an error message.
   */
  async listFiles() {
    try {
      const params = {
        Bucket: this.bucketName,
        MaxKeys: 1000,
      };
      const data = await this.s3.listObjectsV2(params).promise();
      return { success: true, data: data.Contents || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = FilebaseClient;
