const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Función para descargar una imagen y guardarla en una carpeta
const downloadImage = async (url) => {
  // Carpeta donde se guardarán las imágenes
  const outputFolder = './public/assets/images/products';
  try {
    // Obtener el nombre del archivo desde la URL
    const partUrl=url.split("/");
    const tamano=partUrl.length;
    const fileName = partUrl[tamano-3]+"-"+partUrl[tamano-2]+"-"+partUrl[tamano-1];
    
    // Crear la ruta completa para guardar la imagen
    const filePath = path.join(outputFolder, fileName);

    // Realizar la solicitud HTTP para obtener la imagen
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream', // Manejar el archivo como un flujo de datos
        headers: {
          Referer: 'https://yupoo.com/', // Cambia esto según sea necesario
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        },
    });

    // Escribir la imagen en el archivo
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Esperar a que termine la escritura
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    console.log(`Imagen descargada: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`Error descargando la imagen: ${url}`, error.message);
  }
};



module.exports={downloadImage}


