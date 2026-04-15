const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer();

app.post("/api/remove-bg", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }

    try {
        const formData = new FormData();
        formData.append("image_file", req.file.buffer, {
             filename: req.file.originalname,
             contentType: req.file.mimetype,
        });
        formData.append("size", "auto");

        const response = await axios.post(
            "https://api.remove.bg/v1.0/removebg",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "X-Api-Key": "2Dfua5t4m118s7Km8KLoTCpU",
                },
                responseType: "arraybuffer",
            }
        );

        res.set("Content-Type", "image/png");
        res.send(response.data);
    } catch (error) {
        console.error("Error from remove.bg API:", error.response?.data?.toString() || error.message);
        if (error.response?.status === 402) {
             res.status(402).json({ message: "Remove.bg API credits exceeded." });
        } else if (error.response?.status === 403) {
             res.status(403).json({ message: "Invalid API key." });
        } else {
             res.status(500).json({ message: "Error processing the image background removal." });
        }
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));