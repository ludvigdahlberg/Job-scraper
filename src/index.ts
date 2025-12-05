import express from "express";
import { scrapeJobs } from "./scraper/scraper.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/scrape", async (req, res) => {
    const searchText = req.query.q as string || "systemutvecklare";
    const ads = await scrapeJobs(searchText);
    res.json(ads);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});