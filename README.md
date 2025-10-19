# Pulse

## What is it?
Pulse is a mental wellness application designed to provide users with tools and resources to manage their emotional well-being. It features a real-time chatroom for community support, a mood tracker to monitor emotional states, and AI-powered conversational agents for guidance and insights.

## Features
- **Real-time Chatroom:** Connect with a supportive community and share experiences in a live chat environment.
- **Mood Tracking:** Monitor and visualize your emotional well-being over time with a dedicated mood tracker.
- **AI Chatbot:** Engage with an AI-powered chatbot for personalized guidance, insights, and support.
- **Journaling:** A private space for users to reflect on their thoughts and feelings.
- **Community Support:** Foster connections and engage in discussions within various communities.
- **Meditation Resources:** Access guided meditations and mindfulness exercises.

## Tech Stack
**Frontend:**
- **React:** A JavaScript library for building user interfaces.
- **React Router DOM:** For declarative routing in React applications.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Recharts:** A composable charting library built with React and D3.

**Backend:**
- **Python (Flask/Django - to be confirmed):** Likely for the chatroom server.
- **Node.js (Express):** For the mood server and API handling.
- **Google Generative AI / OpenAI:** For AI-powered features like the chatbot.

**Containerization:**
- **Docker & Docker Compose:** For building, running, and orchestrating the application services.

## How to Run
To get the Pulse application up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kaustubhjata/pulse.app
    ```
2. Open the model directory and run 'pip install -r requirements.txt' and 'npm install' in         frontend directory

3. In the serverrun.py file, adjust your routes to 'model/app.py' and 'model/server.py'

4. Access the frontend by running 'npm start' in the frontend directory and the backend by running 'python serverrun.py' in the model directory.

5.  **Access the application:**
    Once the services are running, open your web browser and navigate to `http://localhost:3000` (or the port specified in the `frontend/package.json` proxy if different, typically 3000 or 5000 for React apps).