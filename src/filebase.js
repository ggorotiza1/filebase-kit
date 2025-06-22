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
   * Sube un archivo al bucket de Filebase, asegurándose de no sobrescribir uno existente.
   * Si ya existe un archivo con el mismo nombre, agrega un sufijo (1), (2), etc.
   * @param {string} filePath - Ruta local del archivo.
   * @param {string} fileName - Nombre deseado en el bucket.
   * @param {object} [metadata={}] - Metadatos opcionales.
   * @returns {Promise<object>} Resultado del upload con URL o mensaje de error.
   */
  async uploadFile(filePath, fileName, metadata = {}) {
    try {
      const fileContent = fs.readFileSync(filePath);

      // Separar nombre y extensión
      const extIndex = fileName.lastIndexOf('.');
      const baseName = extIndex !== -1 ? fileName.substring(0, extIndex) : fileName;
      const extension = extIndex !== -1 ? fileName.substring(extIndex) : '';

      let finalKey = fileName;
      let suffix = 1;

      // Verificar existencia y generar nombre único si es necesario
      while (true) {
        const exists = await this.getFileMetadata(finalKey);
        if (!exists.success) break;
        finalKey = `${baseName}(${suffix})${extension}`;
        suffix++;
      }

      const params = {
        Bucket: this.bucketName,
        Key: finalKey,
        Body: fileContent,
        ContentType: 'application/pdf',
        Metadata: metadata,
      };

      const data = await this.s3.upload(params).promise();

      return {
        success: true,
        data: {
          location: data.Location,
          key: finalKey,
        },
      };
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

  /**
 * Deletes a file from the Filebase bucket.
 * @param {string} fileName - The key (name) of the file to delete.
 * @returns {Promise<object>} A promise resolving to an object with success status or error message.
 */
  async deleteFile(fileName) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
      };
      await this.s3.deleteObject(params).promise();
      return { success: true, message: `Archivo "${fileName}" eliminado correctamente.` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
 * Renombra un archivo en el bucket, agregando un sufijo si el nuevo nombre ya existe.
 * Por ejemplo: documento.pdf → documento(1).pdf → documento(2).pdf, etc.
 * @param {string} oldKey - Nombre actual del archivo.
 * @param {string} newKey - Nuevo nombre deseado.
 * @returns {Promise<object>} Resultado con `success`, `message` o `error`.
 */
  async renameFile(oldKey, newKey) {
    try {
      // Separar nombre y extensión
      const extIndex = newKey.lastIndexOf('.');
      const baseName = extIndex !== -1 ? newKey.substring(0, extIndex) : newKey;
      const extension = extIndex !== -1 ? newKey.substring(extIndex) : '';

      let finalKey = newKey;
      let suffix = 1;

      // Buscar un nombre disponible
      while (true) {
        const exists = await this.getFileMetadata(finalKey);
        if (!exists.success) break; // no existe, lo podemos usar
        finalKey = `${baseName}(${suffix})${extension}`;
        suffix++;
      }

      // Copiar el archivo al nuevo nombre disponible
      await this.s3.copyObject({
        Bucket: this.bucketName,
        CopySource: `/${this.bucketName}/${encodeURIComponent(oldKey)}`,
        Key: finalKey,
      }).promise();

      // Eliminar el original
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: oldKey,
      }).promise();

      return {
        success: true,
        message: `Archivo renombrado de "${oldKey}" a "${finalKey}".`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = FilebaseClient;
