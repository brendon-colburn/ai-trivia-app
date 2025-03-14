# AI Trivia App

Welcome to the AI Trivia App repository! This project harnesses the power of artificial intelligence to generate engaging and dynamic trivia questions, providing a unique and interactive experience for users.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Azure Cosmos DB Setup](#azure-cosmos-db-setup)
- [Usage](#usage)
- [Modes](#modes)
- [Planned Features](#planned-features)
- [Contributing](#contributing)
- [License](#license)

## Features
- **AI-Generated Questions:** Dynamically create trivia questions using advanced language models.
- **Interactive UI:** Enjoy a responsive and user-friendly interface built with React and TailwindCSS.
- **Dual Modes:** Choose between a simple mode (using custom categories) and a complex mode (using a document/website URL as the knowledge source).
- **Real-Time Evaluation:** Get instant feedback on your answers with structured evaluation responses.
- **Azure Cosmos DB Backend:** Store and retrieve user scores using Azure Cosmos DB.

## Installation
Follow these steps to set up the project locally:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/brendon-colburn/ai-trivia-app.git
    ```
2. **Navigate to the project directory:**
    ```bash
    cd ai-trivia-app
    ```
3. **Install dependencies:**
    ```bash
    npm install
    ```
4. **Configure Environment Variables:**
    Create a `.env` file in the project root and add your credentials. For example:
    ```env
    # OpenAI API Key
    OPENAI_API_KEY=your_openai_api_key_here

    # Server Configuration
    PORT=5000

    # Cosmos DB Configuration
    COSMOS_DB_ENDPOINT=https://your-cosmosdb-account.documents.azure.com:443/
    COSMOS_DB_KEY=your_cosmosdb_key_here
    COSMOS_DB_DATABASE_ID=TriviaDB
    COSMOS_DB_CONTAINER_ID=Scores
    ```
5. **Start the Server:**
    ```bash
    npm run server
    ```
6. **Run the Application:**
    In a new terminal window, start the React app:
    ```bash
    npm start
    ```

## Azure Cosmos DB Setup
To enable the Cosmos DB backend for saving and retrieving scores, follow these steps:

1. **Create an Azure Resource Group:**
    ```bash
    az group create --name MyResourceGroup --location "East US"
    ```
2. **Create a Cosmos DB Account using the SQL API:**
    ```bash
    az cosmosdb create --name MyCosmosDbAccount --resource-group MyResourceGroup --kind GlobalDocumentDB
    ```
3. **Create a Database named `TriviaDB`:**
    ```bash
    az cosmosdb sql database create --account-name MyCosmosDbAccount --resource-group MyResourceGroup --name TriviaDB
    ```
4. **Create a Container named `Scores` with a partition key `/userId`:**
    ```bash
    az cosmosdb sql container create --account-name MyCosmosDbAccount --resource-group MyResourceGroup --database-name TriviaDB --name Scores --partition-key-path "/userId" --throughput 400
    ```
   
   Alternatively, you can provision these resources using Terraform. Refer to the `main.tf` example in the project for guidance.

5. **Update your `.env` file:**
   Replace the placeholder values in your `.env` file with the actual details from your Azure Cosmos DB setup.

## Usage
Once the application is running:
- **Simple Mode:** Enter custom categories to generate a trivia board tailored to your chosen topics.
- **Complex Mode:** Provide a URL to a document or website, and let the app generate trivia questions based on the content.
- Follow the on-screen instructions to answer questions and receive immediate feedback on your responses.

## Modes
- **Simple Mode:** Input your own categories to create a traditional trivia board.
- **Complex Mode:** Leverage external content by entering a document or website URL, transforming the provided material into a dynamic trivia experience.

## Planned Features
- **Scoring & Ranking System:** Track your performance with an integrated scoring system and compare your results on a leaderboard. (Coming Soon)

## Contributing
Contributions are highly encouraged! Whether it's a bug fix, feature enhancement, or new documentation, your input is welcome. Please:
- Open an issue to discuss your ideas.
- Submit a pull request with your changes.
- Follow the existing code style and include tests where applicable.

## License
This project is licensed under the [MIT License](LICENSE).

---

Feel free to reach out if you have any questions or suggestions. Happy coding and enjoy the trivia!
