import bodyParser from "body-parser";
import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const result = await axios.get(" https://api.thecatapi.com/v1/images/search?limit=10");
        const cats = result.data;
        res.render("index.ejs", { cats: cats});
    } catch (error) {
        console.log(error.response.data);
        res.status(500);
    }
});

app.get("/gallery", async (req, res) => {
    try {
        const breedsResponse = await axios.get("https://api.thecatapi.com/v1/breeds");
        let breedsData = breedsResponse.data;

        const query = req.query.query ? req.query.query.toLowerCase() : null;
        if (query) {
            breedsData = breedsData.filter(breed => breed.name.toLowerCase().includes(query));
        }

        for (let breed of breedsData) {
            const imageResponse = await axios.get(`https://api.thecatapi.com/v1/images/search?breed_ids=${breed.id}`);
            if (imageResponse.data.length > 0) {
                breed.image = imageResponse.data[0].url;
            } else {
                breed.image = null;
            }
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedData = breedsData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(breedsData.length / limit);

        res.render('gallery.ejs', { data: paginatedData, page, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data');
    }
});

app.get("/random", async (req, res) => {
    try {
        const breedsResponse = await axios.get("https://api.thecatapi.com/v1/breeds");
        let breedsData = breedsResponse.data;

        for (let breed of breedsData) {
            const imageResponse = await axios.get(`https://api.thecatapi.com/v1/images/search?breed_ids=${breed.id}`);
            if (imageResponse.data.length > 0) {
                breed.image = imageResponse.data[0].url;
            } else {
                breed.image = null;
            }
        }

        let randomIndex = Math.floor(Math.random() * breedsData.length);
        let randomBreed = breedsData[randomIndex];

        res.render('random.ejs', { data: randomBreed});
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data');
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});