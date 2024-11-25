const fs = require('fs');
const path = require('path');
const { Product } = require('./js/models');
const axios = require('axios');

function createProducts(){
    async function fetchJson() {
    try {
        console.log(1)
        const response = await axios.get('http://localhost/scrapfutbol/apiweb.php');
        const jsonData = response.data;
        console.log(2)
        if(!jsonData){return null;}
        if(jsonData.length<10){return error;}
        console.log(3)
        await Product.updateMany({}, { $set: { status: false } });
        jsonData.forEach(async e => {
          const {code,product,sport,category,team,mainImg,images,year}=e
          await Product.findOneAndUpdate(
            { code }, // Filtro para buscar el producto por código
            { product, code , price:34.99,sport,category,team,mainImg,images,year,categoryFilter:category.replaceAll(" ","").toLowerCase(),teamFilter:team.replaceAll(" ","").toLowerCase(),status:true}, // Datos a actualizar o insertar
            { upsert: true, new: true } // `upsert: true` crea el documento si no existe
          );
        });
        console.log("productos actualizados")
    } catch (error) {
        console.error('Error al obtener el JSON:', error.message);
    }
}

fetchJson();

return false;
// Define el directorio de la carpeta donde están los archivos JSON
const dataDirectory = path.join(__dirname, 'data');

// Lee todos los archivos en el directorio /data
fs.readdir(dataDirectory, (err, files) => {
  if (err) {
    console.error('Error al leer el directorio:', err);
    return;
  }

  // Filtra solo los archivos .json
  const jsonFiles = files.filter(file => path.extname(file) === '.json');

  // Itera sobre cada archivo JSON y lo lee
  jsonFiles.forEach(async file => {
    const filePath = path.join(dataDirectory, file);
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');
    fs.readFile(filePath, 'utf-8', async(err, data) => {
      if (err) {
        console.error(`Error al leer el archivo ${file}:`, err);
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        const exist=await Product.findOne({code:jsonData.code});
        if(jsonData.code=='Heu21BRkGH'){console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","Heu21BRkGH",exist)}
        if(exist){return false;}
        console.log(`Contenido de ${file}:`, jsonData.code);
        const {code,product,sport,category,team}=jsonData;
        const details=`These jerseys are high-quality Thai replicas, offering an authentic look and feel that closely matches official team gear. Made with premium materials, they’re comfortable, durable, and ideal for fans who want the experience of wearing true-to-design replicas. The jerseys include exact details, such as team logos, sponsor logos, and stitching, replicating the precision of the originals at a fraction of the cost. With these Thai-quality jerseys, fans can proudly show their support while enjoying an affordable yet faithful alternative to the official merchandise. Perfect for both game day and everyday wear, they’re built to last.`
        const p=await new Product({code,product,sport,category,team,categoryFilter:normalize(category),teamFilter:normalize(team),price:49,details});
        p.save()
      } catch (parseErr) {
        console.error(`Error al parsear el archivo ${file}:`, parseErr);
      }
    });
  });
});


}

module.exports={createProducts}

