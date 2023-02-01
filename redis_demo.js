const redis = require('redis');
const client = redis.createClient();
const axios = require('axios');
const express = require('express');
const { response } = require('express');

const app = express();
const USERS_API = 'https://jsonplaceholder.typicode.com/users/';


const products = [
    { productName: 'Laptop', price: 27 },
    { productName: 'Charger', price: 32 },
    { productName: 'mobile phone', price: 45 }
]

app.get('/productList', async(req, res) => {
    try {
        client.get('product', async(err, product) => {
            if (err) {
                console.error(err);
                throw err;
            }
            if (product != null) {
                console.log('products retrieved from Redis');
                res.status(200).send(JSON.parse(product));
            } else {
                // const product = await products.find()
                res.json(products)
                client.setex('product', 600, JSON.stringify(products));
                console.log('products retrieved from the API');
            }
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
})

app.get('/api/product/price/:price', (req, res) => {
    try {
        client.get('productName', async(err, productName) => {
            if (err) {
                console.error(err);
                throw err;
            }
            if (productName != null) {
                console.log('products retrieved from Redis');
                res.status(200).send(JSON.parse(productName));
            } else {
                // const product = await products.find()
                const product = products.find(v => v.price === parseInt(req.params.price))
                if (!product) res.status(404).send('Data not found.')
                res.send(product)
                client.setex('productName', 600, JSON.stringify(productName));
                console.log('products retrieved from the API');
            }
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }


})

app.get('/users', (req, res) => {

    try {
        axios.get(`${USERS_API}`).then(function(response) {
            const users = response.data;
            console.log('Users retrieved from the API');
            res.status(200).send(users);
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/cached-users', (req, res) => {
    try {
        client.get('users', (err, data) => {
            if (err) {
                console.error(err);
                throw err;
            }
            if (data) {
                console.log('Users retrieved from Redis');
                res.status(200).send(JSON.parse(data));
            } else {
                axios.get(`${USERS_API}`).then(function(response) {
                    const users = response.data;
                    client.setex('users', 600, JSON.stringify(users));
                    console.log('Users retrieved from the API');
                    res.status(200).send(users);
                });
            }
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
});