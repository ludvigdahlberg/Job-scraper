import express from "express";
import { scrapeJobs } from "./scraper/scraper.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Serva static-filer från /public
app.use(express.static("src/public"));

const skaneCities = [
  "Malmö",
  "Lund",
  "Helsingborg",
  "Kristianstad",
  "Hässleholm",
  "Trelleborg",
  "Ystad",
  "Eslöv",
  "Landskrona",
  "Ängelholm"
];

const titles = [
  "systemutvecklare",
  "programmerare",
  "mjukvaruutvecklare",
  "frontendutvecklare",
  "backendutvecklare"
];

app.get("/scrape", async (req, res) => {
  try {
    const query = (req.query.q as string | undefined)?.trim();
    const effectiveTitles = query ? [query] : titles;

    let allAds: any[] = [];

    for (const title of effectiveTitles) {
      const ads = await scrapeJobs(title);
      allAds = allAds.concat(ads);
    }

    // Filtrera på Skåne
    const skaneAds = allAds.filter(
      (ad) => ad.workplace && skaneCities.includes(ad.workplace)
    );

    // Formatera snyggt för frontend
    const formatted = skaneAds.map((ad) => ({
      id: ad.id,
      title: ad.title,
      company: ad.workplaceName,
      city: ad.workplace,
      published: ad.publishedDate,
      lastApply: ad.lastApplicationDate,
      link: `https://arbetsformedlingen.se/platsbanken/annonser/${ad.id}`
    }));

    res.json(formatted);
  } catch (err) {
    console.error("/scrape error:", err);
    res.status(500).json({ error: "Något gick fel i /scrape" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
