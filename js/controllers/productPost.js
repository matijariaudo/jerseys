const { jsonAnswer } = require("../helpers/apiFormat");
const { downloadImage } = require("../helpers/downloadPictures");
const { Product, Cupon } = require("../models");
const fs = require('fs');
const path = require('path');


const getProducts = async (req, res) => {
    try {
        const { init = 0, qty = 12, sortBy = 'year', sortOrder = 'desc', status, sport, category, team } = req.body;
        const start = parseInt(init, 10) || 0;
        const limit = parseInt(qty, 10) || 10;
        const order = sortOrder === 'desc' ? -1 : 1;

        const filter = {};
        if (status !== undefined) filter.status = status === 'true';
        const buildRegex = (input) => new RegExp(`^${input.split(' ').join('')}|${input}`, 'i');
        if (sport) filter.sport = { $regex: buildRegex(sport) };
        if (category) filter.categoryFilter = { $regex: buildRegex(category) };
        if (team) filter.teamFilter = { $regex: buildRegex(team) };

        const totalRecords = await Product.countDocuments(filter);

        // Consistencia en el orden
        const products = await Product.find(filter)
            .sort({ [sortBy]: order }) // Orden estable con `_id`
            .skip(start)
            .limit(limit);
        
        products.forEach(e=>{
            console.log(e.year,e.product)
        })

        return res.status(200).json(await jsonAnswer(200, null, 'Successful Operation', {
            totalRecords,
            init,
            qty,
            sortBy,
            sortOrder,
            products,
        }));
    } catch (error) {
        return res.status(400).json(await jsonAnswer(400, 'The operation has failed', '-', null));
    }
};

const getCategories = async (req, res) => {
    try {
        // Obtener todos los productos para procesarlos
        const products = await Product.find({}, 'sport category team');

        // Crear un objeto para almacenar la estructura solicitada
        const result = {
            sports: [],
            categories: {},
            teams: {}
        };

        // Recorrer cada producto y organizar los datos en la estructura deseada
        products.forEach(product => {
            const { sport, category, team } = product;

            // Añadir el deporte si no está en la lista
            if (!result.sports.includes(sport)) {
                result.sports.push(sport);
            }

            // Añadir la categoría con un enlace a su deporte si no existe en el objeto categories
            if (category && !result.categories[category]) {
                result.categories[category] = sport;
            }

            // Añadir el equipo con un enlace a su categoría si no existe en el objeto teams
            if (team && !result.teams[team]) {
                result.teams[team] = category;
            }
        });

        // Devolver el resultado con la estructura deseada
        return res.status(200).json(await jsonAnswer(200, null, "Categories, teams, and sports found successfully", result));
    } catch (error) {
        return res.status(500).json(await jsonAnswer(500, "The operation has failed", "-", null));
    }
}

const getProductsByCodes= async (req, res) => {
        try {
            // Obtener el array de códigos desde el body de la petición
            const { productCodes, img = false } = req.body;
            console.log(productCodes)
            // Verificar que el array de códigos esté presente y no esté vacío
            if (!productCodes || !Array.isArray(productCodes) || productCodes.length === 0) {
                return res.status(400).json(await jsonAnswer(400, "Invalid product codes array", "-", null));
            }
            
            // Buscar los productos que coincidan con los códigos proporcionados
            const products = await Product.find({
                code: { $in: productCodes }  // Filtrar productos cuyo código esté en el array de productCodes
            });
    
            // Si no se encuentran productos
            if (products.length === 0) {
                return res.status(404).json(await jsonAnswer(404, "No products found with the provided codes", "-", null));
            }
    
            // Si img es true, buscar imágenes en la carpeta /images/producto/${code} para cada producto
            const images = [];
            if (img === true) {
                products.forEach((e, i) => {
                    const imagePath = path.join(__dirname, `../../public/assets/images/products`);
                    images[i] = {};
                    // Si la carpeta de imágenes del producto existe, obtener los nombres de los archivos
                    if (fs.existsSync(imagePath)) {
                        const imagesSearch = fs.readdirSync(imagePath).map(imageFile => imageFile).filter(a=>a.indexOf(e.code)>-1);
                        images[i].images = imagesSearch;  // Añadir las imágenes al objeto de cada producto
                    } else {
                        images[i].images = [];  // Si no hay imágenes, devolver un array vacío
                    }
                });
            }
    
            // Devolver los productos encontrados
            return res.status(200).json(await jsonAnswer(200, null, "Products found successfully", { products, images }));
        } catch (error) {
            return res.status(500).json(await jsonAnswer(500, "The operation has failed", "-", null));
        }
    };

const checkCupon=async(req,res)=>{
    try {
        const {code}=req.body
        const cupon=await Cupon.findOne({code});
        return res.status(200).json(await jsonAnswer(200,null,`Successful Operation: We have found your API tokens.`,{cupon}));
    } catch (error) {
        return res.status(200).json(await jsonAnswer(400,"The operation has failed","-",null));
    }
}

const createCupon=async(req,res)=>{
    try {
        const {code,amount}=req.body
        const newCupon=new Cupon({code,amount});
        await newCupon.save()
        return res.status(200).json(await jsonAnswer(200,null,`Successful Operation: We have found your API tokens.`,{cupon:newCupon}));
    } catch (error) {
        return res.status(200).json(await jsonAnswer(400,"The operation has failed","-",null));
    }
}

const createProduct=async(req,res)=>{
    try {
        const {product,price,code,category,sport,team,details}=req.body
        const newProduct=new Product({product,price,code,category,sport,team,details});
        await newProduct.save()
        return res.status(200).json(await jsonAnswer(200,null,`Successful Operation: We have found your API tokens.`,{product:newProduct}));
    } catch (error) {
        return res.status(200).json(await jsonAnswer(400,"The operation has failed","-",null));
    }
}

const productImage=async (req, res) => {
    const imageUrl = req.query.url; // Recibir la URL como parámetro de consulta
    try {
      // Descargar la imagen
      const filePath = await downloadImage(imageUrl);
      // Enviar la imagen como respuesta al usuario
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      res.status(500).send('Error al descargar la imagen.');
    }
}

module.exports={getProducts,createProduct,getProductsByCodes,getCategories,checkCupon,createCupon,productImage}