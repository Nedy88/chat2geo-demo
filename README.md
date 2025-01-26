# Chat2Geo: A ChatGPT-Like Web App for Remote-Sensing-Based Geospatial Analysis

Chat2Geo is a **Next.js 15** application providing a **chatbot-like** user interface for performing **remote-sensing-based geospatial analyses**. It leverages **Google Earth Engine (GEE)** in the backend to process and analyze various remote sensing datasets in real time. Users can **upload their own vector data**, run advanced geospatial queries, and integrate the results with an **AI Assistant** for specialized tasks such as **land cover mapping**, **change detection**, and **air pollutant monitoring**. Chat2Geo also has advanced knowledge retrieval based on Retrieval-augmented generation (RAG), which can integrate geospatial analysis with non-geospatial/textual information. The app also has authentication and database integrations. Chat2Geo inherits a large portion of its building blocks from the GRAI 2.0 app that is under development at GeoRetina (www.georetina.com). In parallel with GRAI 2.0 (which I plan to open-source once it's stable), I will also keep Chat2Geo updated for the community.


https://github.com/user-attachments/assets/d9940a0e-10c8-4d0e-9ec9-3dfd0966c664


## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Current Analyses](#current-analyses)
- [Considerations](#considerations)
- [Contributing](#contributing)

---

## Features ✨

1. **Chat-Style Interface**

   - Interact with the system using natural language.
   - The AI Assistant can execute various **geospatial functions** on your behalf.

2. **Google Earth Engine Integration**

   - Real-time access to satellite imagery and remote sensing datasets.
   - Seamless backend processing for large-scale geospatial computations.

3. **Import Your Own Vector Data**

   - Upload and manage personal vector layers.
   - Integrate your data with Earth Engine operations for advanced queries.

4. **Analysis Toolkit**

   - **Air Pollutants**
   - **Urban Heat Island (UHI)** metrics
   - **Land Cover** mapping & **Change Detection**
   - Custom AI models deployed on **Vertex AI** for certain land cover tasks

5. **RAG & Knowledge Base**
   - Enables a Retrieval-Augmented Generation (RAG) workflow.
   - Upload documents to build a local knowledge base.
   - The AI Assistant can then combine geospatial insights with custom document knowledge.


## Tech Stack 💻
- Google Cloud Platform (GCP):
   - Google Earth Engine (remote-sensing data invocation and processing)
   - Vertex AI (custom AI vision models)
   - Cloud Run
- OpenAI (ChatGPT API)
- Supabase (database and authentication)
- LangChain (RAG)
- Maplibre GL (for displaying maps)

## Getting Started 🚀

1. Clone the repo

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up the environment variables

- Create a `.env.local` file (or similar) with the required credentials for:

  - Google Cloud Platform (GCP):
    ```
      VERTEXTAI_ENDPOINT_BASE_URL   # Base URL if you use your own custom models
      GEE_CLOUD_RUN_URL             # URL for invoking a model hosted on VertexAI using cloud functions
      GCP_BUCKET_NAME               # Bucket name to store the land-cover map generated by your custom model (if applicable)
      GCP_SERVICE_ACCOUNT_KEY       # Service Account key needed for GEE functions, depending on your GCP configurations
    ```
  - For the database & authentication, the app uses Supabase. So you need the Supabase API keys as well:

        NEXT_PUBLIC_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY

  - If you want Esri integration, you also need the following keys in your env (skip this part if you don't want this integration):

        ARCGIS_CLIENT_ID=
        ARCGIS_CLIENT_SECRET=
        ARCGIS_REDIRECT_URI=

- For feedback submission, I just used a simple email-based pipeline based on Mailgun (skip this part if you don't want this feature):

        MAILGUN_API_KEY=
        MAILGUN_DOMAIN=
        RECIPIENT_EMAIL=
        SENDER_EMAIL=

3. Run the develpment server

```bash
npm run dev
```

Visit http://localhost:3000 to view the application.



## Available Geospatial Analyses 📊

Three sample analyses are included in this app: 
   1. urban heat island (UHI) analysis
   2. land-use/land-cover mapping (using Google DynamicWorld)
   3. land-use/land-cover change mapping (using Google DynamicWorld)
   4. air pollution analysis


## Considerations💡

- It should be noted that this app is not yet ready for production. The app has known bugs, and perhaps unknown ones😁 Some functionalities have not been implemented yet.
- GEE-based geospatial analyses are just simple examples of how such analyses can be implemented and added. Some of them are using data that may not be up-to-date. As a result, care should be taken while interpreting the results.
- There are parts that should be refactored or re-designed either because they could have been used/invoked in a better place, or because they should've been implemented in a much better manner.


## Contributing 🛠️

If you're interested in contributing to this project, please contact me at `shahabj.github@gmail.com`.
