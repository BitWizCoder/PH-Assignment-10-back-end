const express = require("express");
const {
  MongoClient,
  ServerApiVersion,
  CURSOR_FLAGS,
  ObjectId,
} = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const userName = process.env.USERNAME;
const password = process.env.PASSWORD;

const uri = `mongodb+srv://${userName}:${password}@cluster0.oed8bqi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const proudctDB = client.db("proudctDB");
    const products = proudctDB.collection("products");
    const favorites = proudctDB.collection("favorites");

    // Add a product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await products.insertOne(product);
      res.send(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    });

    // Get all products
    app.get("/products", async (req, res) => {
      const allProducts = await products.find().toArray();
      res.send(allProducts);
    });

    // Get a products based on brands
    app.get("/products/:brand", async (req, res) => {
      const brand = req.params.brand;

      const products = await proudctDB
        .collection("products")
        .find({ brand: brand })
        .toArray();

      res.send(products);
    });

    // Get a products based on id
    app.get("/products/details/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };

      const product = await products.findOne(filter);

      res.send(product);
    });

    // Add to favariot
    app.post("/favorites", async (req, res) => {
      const favorite = req.body;
      const result = await favorites.insertOne(favorite);
      res.send(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    });

    // Get all favorites
    app.get("/favorites", async (req, res) => {
      const allFavorites = await favorites.find().toArray();
      res.send(allFavorites);
    });


    // Delete a favorite
    app.delete("/favorites/:id", async (req, res) => {
      const id = req.params.id;
    
      const filter = { _id: new ObjectId(id) };
    
      const result = await favorites.deleteOne(filter);
    
      res.send(result);
    });
    

    // update a product
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
    
      const filter = { _id: new ObjectId(id) };
      const update = { $set: req.body };
    
      const result = await products.updateOne(filter, update);
    
      res.send(result);
    });
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
