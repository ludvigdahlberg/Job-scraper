import axios from 'axios';

export async function scrapeJobs(searchText: string) {
    const body = {
    filters: [
        {
            type: "freetext",
            value: searchText
        }
    ],
    fromDate: null,
    maxRecords: 25,
    order: "relevance",
    source: "pb",
    startIndex: 0,
    toDate: new Date().toISOString()
};

     const respons = await axios.post("https://platsbanken-api.arbetsformedlingen.se/jobs/v1/search",
    body);

    const data = respons.data;
    const ads = data.ads;
    return ads;

}