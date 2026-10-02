require("dotenv").config();
const isValidUrl = require('./validateUrl');
const pool = require('./db');
const generateCode = require('./generateCode');
const cors = require("cors"); 

const express = require("express");
const app = express();

// middleware
app.use(cors());      
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: "okk" });
})

app.post('/shorten', async(req, res, next) => {
    const { url } = req.body || {}; 
    if (!isValidUrl(url)) {
        return res.status(400).json({ error: "Please provide a valid url" });
    }
    const maxAtttempts = 3;
    for (let attempt = 0; attempt < maxAtttempts; attempt++) {  
        try {
            const shortCode = generateCode();
            const result = await pool.query(
                "INSERT INTO url_table (url, short_code) VALUES ($1, $2) RETURNING *",
                [url, shortCode]
            );
           return res.status(201).json(result.rows[0])
        } catch (error) {
            console.error(error);
            if (error.code === "23505") {
                console.log("temporary: code collision, please retry");
            }else{
                next(error);
            }
        }
    }
    return res.status(500).json({ error: "Could not generate a unique code, please try again" });
})

app.get("/shorten/:code", async(req, res, next) => {
    try {
        const { code } = req.params;
        const result = await pool.query(
            "UPDATE url_table SET access_count = access_count + 1 WHERE short_code = $1 RETURNING *",
            [code]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Short URL not found"})
        }
        return res.status(200).json(result.rows[0]);   
    } catch (error) {
        next(error);
    }

});

app.put("/shorten/:code", async(req, res, next) => {
    try {
        const { code } = req.params;
        const { url } = req.body || {};
        if (!isValidUrl(url)) {
            return res.status(400).json({ error: "Please provide a valid url" });
        }
        const result = await pool.query(
            "UPDATE url_table SET url = $1, updated_at = now() WHERE short_code = $2 RETURNING *",
            [url, code]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Short URL not found"});
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
   
})

app.delete("/shorten/:code", async(req, res, next) => {
    try {
        const { code } = req.params;
        const result = await pool.query(
        "DELETE FROM url_table WHERE short_code = $1 RETURNING *",
        [code]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Short url not found"});
        }
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
})

app.get("/shorten/:code/stats", async(req, res, next) => {
    try {
        const { code } = req.params;
        const result = await pool.query(
            "SELECT * FROM url_table WHERE short_code = $1",
            [code]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Short URL not found"});
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
    
})

app.use((req, res) => {
    res.status(404).json({ error: "Route not found"})
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started running at port ${PORT}`);
})

