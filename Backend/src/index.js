require("dotenv").config();
const isValidUrl = require('./validateUrl');
const pool = require('./db');
const generateCode = require('./generateCode');
const cors = require("cors"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");
const optionalAuth = require("./optionalAuth");

const express = require("express");
const app = express();

// middleware
app.use(cors());      
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: "okk" });
})

app.post('/shorten', optionalAuth, async(req, res, next) => {
    const { url } = req.body || {}; 
    if (!isValidUrl(url)) {
        return res.status(400).json({ error: "Please provide a valid url" });
    }
    const maxAtttempts = 3;
    for (let attempt = 0; attempt < maxAtttempts; attempt++) {  
        try {
            const shortCode = generateCode();
            const result = await pool.query(
                "INSERT INTO url_table (url, short_code, user_id) VALUES ($1, $2, $3) RETURNING *",
                [url, shortCode, req.user?.userId || null]
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

app.post("/auth/signup", async(req, res, next) => {
    const {email, password} = req.body || {};
    if (!email || !password) {
        return res.status(400).json({error: "Please provide valid details"});
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at", 
        [email, hashedPassword]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({error:"Email already in use"})
        }
        next(error);
    }
})
app.post("/auth/login", async(req, res, next) => {
    const {email, password} = req.body || {};
    if (!email || !password) {
        return res.status(400).json({error: "Please provide valid details"});
    }
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Invalid credentials"});
        }
        const foundUser = result.rows[0];
        const validPassword = await bcrypt.compare(password, foundUser.password_hash);
        if (!validPassword) {
            return res.status(404).json({error: "Invalid credentials"});
        }
        const token = jwt.sign(
            {userId: foundUser.id, email: foundUser.email},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        )
        return res.status(200).json({ id: foundUser.id, email: foundUser.email , token: token});
    } catch (error) {
        next(error);
    }
})

app.get("/me/links", authMiddleware, async(req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM url_table WHERE user_id = $1",
            [req.user.userId]
        );
        return res.status(200).json(result.rows);       
    } catch (error) {
        next(error)
    }
});

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
