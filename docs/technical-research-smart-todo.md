# Technical Research: Smart To-Do List with AI Labels

## 1. Introduction

This document outlines a technical strategy for building a "Smart To-Do List" application. The key feature of this application is the use of Artificial Intelligence to automatically suggest and apply labels to to-do items as users create them. This research considers the existing code snippets and project structure to provide relevant and suitable technology recommendations.

## 2. Core Feature: AI-Powered Labeling

The "AI Labels" feature is a text classification problem. When a user enters a new to-do item (e.g., "Buy milk and eggs for breakfast"), the system should automatically predict relevant labels (e.g., "Groceries", "Shopping").

There are several approaches to implement this, with different trade-offs in terms of complexity, cost, and accuracy:

*   **Zero-Shot/Few-Shot Classification with Large Language Models (LLMs):**
    *   **How it works:** Use a powerful LLM (like GPT-4, Llama 3, or a Gemini model) with a well-crafted prompt. The prompt would include the to-do item's text and a request to generate appropriate labels from a predefined list or even create new ones.
    *   **Pros:** Easy to implement, no training data required, very flexible.
    *   **Cons:** Higher latency, potential cost associated with API calls to commercial models.
    *   **Recommendation:** This is a great starting point, especially for a prototype. The existing `OpenAIResponsesModel` code suggests that an integration with an OpenAI-compatible API is already being considered.

*   **Fine-Tuning a Pre-trained Model:**
    *   **How it works:** Take a smaller, pre-trained language model (e.g., from the Hugging Face Hub) and fine-tune it on a custom dataset of to-do items and their corresponding labels.
    *   **Pros:** High accuracy, low latency, and low cost for inference after the initial training.
    *   **Cons:** Requires creating a labeled dataset, and the process of fine-tuning is more complex.

*   **Embedding-Based Similarity Search:**
    *   **How it works:** Pre-define a list of labels. When a new to-do is created, generate a text embedding (a vector representation) for the to-do item and for each of the labels. Then, use cosine similarity to find the most relevant labels.
    *   **Pros:** Very fast, very low computational cost.
    *   **Cons:** Less "intelligent" than LLM-based approaches; it might struggle with nuances and context.

## 3. Proposed Architecture

A suitable architecture would consist of three main components:

1.  **Frontend Application:** A web-based interface where users can manage their to-do lists.
2.  **Backend API:** A service to handle business logic, data storage, and communication with the AI model.
3.  **AI Service/Model:** The component responsible for generating the labels. This could be an external API or a self-hosted model.

```
[Frontend] <--> [Backend API] <--> [AI Service/Model]
   |                 |
   |                 v
   +------------> [Database]
```

## 4. Technology Stack Recommendations

Based on the provided snippets and modern development practices, here is a recommended technology stack:

### Frontend
*   **Framework:** **React** (or a framework like **Next.js**). The provided snippet `ApplicationsPage.tsx` suggests React is already in use with `useRouter` and JSX.
*   **Styling:** **Tailwind CSS** for utility-first styling. It works well with React and allows for rapid UI development. The `className` props in the snippet suggest a utility-based CSS approach.
*   **State Management:** React Query (TanStack Query) for managing server state (fetching, caching, updating data) and Zustand or Redux for client state.

### Backend
*   **Language:** **Python**. The project contains a significant amount of Python code.
*   **Framework:** **FastAPI**. It's a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. It's easy to learn and use, and it automatically generates interactive API documentation.
*   **Database:**
    *   **For Prototyping:** **SQLite** is a simple, file-based database that is easy to set up.
    *   **For Production:** **PostgreSQL** is a powerful, open-source object-relational database system with a strong reputation for reliability, feature robustness, and performance.
*   **ORM:** **SQLAlchemy** is a popular SQL toolkit and Object-Relational Mapper that gives application developers the full power and flexibility of SQL.

### AI Models and Frameworks

*   **AI Models:**
    *   **Commercial (Recommended for starting):**
        *   **OpenAI Models (e.g., `gpt-3.5-turbo`, `gpt-4o`):** Excellent performance for zero-shot classification. The existing `OpenAIResponsesModel` class points towards this integration.
        *   **Google Gemini Models (e.g., `gemini-1.5-flash`):** Competitive performance and often more cost-effective.
    *   **Open Source (Self-hosted):**
        *   **Llama 3, Mistral, or Phi-3:** These models are smaller but very capable and can be fine-tuned for the specific task of labeling to-do items.

*   **AI Frameworks (Python):**
    *   **Hugging Face `transformers`:** Essential for working with open-source models. It provides the tools to load, train, and run inference on a wide range of models.
    *   **LangChain or LlamaIndex:** These frameworks simplify the process of building applications with LLMs. They provide abstractions for prompt management, chaining calls to models, and connecting to data sources.
    *   **Sentence-Transformers:** The best library for the embedding-based approach.

## 5. Running the Backend (FastAPI)

To get the FastAPI backend running, follow these steps:

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    It's recommended to use a virtual environment.
    ```bash
    python -m venv venv
    ./venv/Scripts/activate   # On Windows
    # source venv/bin/activate # On macOS/Linux
    pip install -r requirements.txt
    ```

3.  **Run the FastAPI application:**
    ```bash
    uvicorn main:app --reload
    ```
    The application will typically run on `http://127.0.0.1:8000`. You can access the automatically generated API documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.

## 6. Next Steps

1.  **Develop the Backend API:** Create a simple FastAPI application with endpoints for CRUD operations on to-do items.
2.  **Integrate an AI Model:** Start with a zero-shot approach using the OpenAI API, given the existing code. Create a service that takes a to-do item's text and returns a list of suggested labels.
3.  **Build the Frontend:** Develop the React components for displaying, creating, and updating to-do items, including the UI for showing and confirming AI-suggested labels.
4.  **Iterate and Improve:** Once the basic application is working, you can explore fine-tuning a smaller model for better performance and lower cost.
