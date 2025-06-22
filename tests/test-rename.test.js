const FilebaseClient = require('../src/filebase');

/**
 * Instancia del cliente Filebase.
 * Reemplaza las credenciales y bucket por tus valores reales.
 */
const client = new FilebaseClient({
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    bucketName: 'YOUR_BUCKET',
});

/**
 * Nombre actual del archivo y nuevo nombre deseado.
 * Asegúrate de que el archivo original exista en el bucket.
 */
const oldFileName = 'EXISTING_FILE.pdf';
const newFileName = 'RENAMED_FILE.pdf';

/**
 * Renombra un archivo en el bucket de Filebase.
 * 
 * Si el nuevo nombre ya existe, se generará automáticamente un nombre con sufijo (1), (2), etc.
 */
async function renameFileInBucket() {
    try {
        // Intentar renombrar el archivo
        const response = await client.renameFile(oldFileName, newFileName);

        // Validar si fue exitoso
        if (!response.success) {
            throw new Error(`Rename error: ${response.error}`);
        }

        console.log(response.message);
    } catch (error) {
        console.error(`Error al renombrar el archivo: ${error.message}`);
    }
}

// Ejecutar función principal
renameFileInBucket();
