# Beauty Lens - Setup Instructions

**Beauty Lens** is a mobile app that helps users understand if skincare and cosmetic products are safe for their skin type. Users upload a selfie to detect their skin type and scan product labels to analyze ingredients. The app uses AI to explain what each ingredient does, flags potential risks, and recommends safer alternatives. It combines machine learning, OCR, and GPT-4o in a simple and intuitive experience, supported by a Flask AI backend, a React Native mobile frontend, and a Spring Boot backend with PostgreSQL.

This guide provides step-by-step instructions to run all three components:

- React Native mobile app (Expo-based)
- Flask AI backend (OCR, GPT, skin classification, recommendation)
- Spring Boot backend (user, scan, and community APIs with PostgreSQL)

---

## Repository Cloning

The project can be cloned from either of the following repositories:

### GitHub (Personal)

```bash
git clone https://github.com/DianaHutuleac/Licenta-BeautyLens.git
cd Licenta-BeautyLens
```

### UPT GitLab

```bash
git clone https://gitlab.upt.ro/diana.hutuleac/Licenta-BeautyLens.git
cd Licenta-BeautyLens
```

---

## Backend 1: Spring Boot (Java)

### Requirements

- Java 17+
- Gradle (or use the wrapper `./gradlew`)
- PostgreSQL 14+
- IntelliJ IDEA (recommended)

### Database Setup

```sql
CREATE DATABASE beauty_lens;
```

### Configuration

Create `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/beauty_lens
spring.datasource.username=your_pg_user
spring.datasource.password=your_pg_password
spring.jpa.hibernate.ddl-auto=update
jwt.secret=your_jwt_secret
```

### Running the Server

```bash
cd mobile_app_spring
./gradlew bootRun
```

Spring Boot backend will be available at `http://localhost:8080`.

---

## Backend 2: Flask AI (Python)

### Requirements

- Python 3.10+
- pip

### Python Dependencies

The required packages are listed in `requirements.txt`:

```
Flask==3.1.0
torch==2.6.0
torchvision==0.21.0
easyocr==1.7.2
opencv-python-headless==4.11.0.86
numpy==2.2.3
Pillow==11.1.0
scikit-learn==1.6.1
Werkzeug==3.1.3
python-dotenv
openai==0.28.1
langdetect
```

Install them with:

```bash
cd backend_flask
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Required Files (Already in GitHub)

- `backend_flask/app/weights/skin_type_model.pth` – Trained PyTorch model (via Git LFS)
- `backend_flask/app/data/known_ingredients.json` – Normalized ingredient database
- `backend_flask/app/data/skincare_products.csv` – Product dataset for recommendation

### OpenAI API Key

Create a `.env` file in `backend_flask/` with:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Make sure `routes.py` and `translation_utils.py` contain:

```python
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
```

### Run the Flask Server

```bash
python app.py
```

Flask API will run at: `http://127.0.0.1:5000`

---

## Frontend: React Native + Expo

### Environment

- Node.js: v21.7.3
- npm: v10.5.0
- Expo CLI: 0.24.13
- Expo SDK: 53.0.9
- React Native: 0.79.2

> These versions were used during development. Slight differences may cause compatibility issues.

### Requirements

- Node.js v18+ (tested with v21.7.3)
- npm v9+ (tested with v10.5.0)
- Expo CLI (tested with v0.24.13)
- iOS Simulator or iPhone with Expo Go Application Installed

### Setup

```bash
npm install -g expo-cli
cd frontend
npm install
```

### Running the App

```bash
npx expo start
```

This will start the Expo development server and open the DevTools in your browser. From there, you can:

- Press `i` in the terminal to launch the app in the iOS Simulator (requires Xcode)
- Or scan the QR code with the **Expo Go** app on your iPhone

> The app was developed and tested primarily on iOS (simulator + physical device). Android compatibility may require additional testing.

---

## Summary

| Component        | Tools / Stack            | Command / Action                  |
| ---------------- | ------------------------ | --------------------------------- |
| Spring Boot API  | Java, Gradle, PostgreSQL | `./gradlew bootRun`               |
| Flask AI Backend | Python, Flask, PyTorch   | `python app.py`                   |
| React Native App | React Native, Expo       | `npx expo start`                  |
| PostgreSQL       | SQL                      | `CREATE DATABASE beauty_lens;`    |
| OpenAI Key       | Environment Variable     | `.env` file with `OPENAI_API_KEY` |

Ensure all services are running before using the app.

---

## Notes

- Do not commit your `.env` file or API keys to Git.
- Model weights are managed using Git LFS.
- Make sure your mobile device is on the same network as your local backend servers during development.
