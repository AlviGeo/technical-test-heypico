const { errorResponse, successResponse } = require("../helpers");
const axios = require("axios");

const search = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt." });
  }

  try {
    // Step 1: Ask LLM to extract a clean search term
    const llmResponse = await axios.post(
      "http://127.0.0.1:11434/api/generate",
      {
        model: "gemma:2b",
        prompt: `
Extract only the clean search term (e.g., "sushi in Jakarta") from this message for a Google Maps search. Respond with just the keyword — no explanations.

User prompt: "${prompt}"
Search term:
      `.trim(),
        stream: false,
      }
    );

    const searchTerm = llmResponse.data?.response?.trim();

    if (!searchTerm) {
      return res
        .status(500)
        .json({ error: "Failed to extract search term from prompt." });
    }

    // Step 2: Query Google Maps API
    const mapsResponse = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      {
        params: {
          query: searchTerm,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const places = mapsResponse.data?.results?.slice(0, 5).map((place) => ({
      name: place.name,
      address: place.formatted_address,
      location: place.geometry.location,
      map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${place.name} ${place.formatted_address}`
      )}`,
    }));

    return successResponse(req, res, "Location Found!", {
      interpreted_query: searchTerm,
      places: places || [],
    });
  } catch (e) {
    console.error("Search error:", e.message);
    return errorResponse(res, 500, "Location not found!");
  }
};
module.exports = search;
