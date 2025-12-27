# 🌐 SmartLingua AI

SmartLingua AI is a full-stack AI-powered language processing application that provides **text translation, document translation, and text-to-speech (TTS)** features using modern web technologies.

The project is built with **React (frontend)**, **FastAPI (backend)**, and **LibreTranslate (Docker-based translation service)**.

---

## ✨ Features

### 🔤 Text Translation
- Translate text between multiple languages
- Supported languages:
  - English
  - Spanish
  - French
  - German
  - Hindi
- Uses **LibreTranslate** for open-source translation

### 📄 Document Translation
- Upload and translate documents:
  - `.txt`
  - `.docx`
  - `.pdf`
- OCR support for scanned PDFs
- Automatic language detection

### 🔊 Text to Speech (TTS)
- Convert text or translated output into speech
- Generates `.mp3` audio files
- Powered by **Google Text-to-Speech (gTTS)**

### ⚡ Real-Time Processing
- Fast and responsive UI
- API-based processing
- Error handling when services are unavailable

---

## 🧱 Tech Stack

### Frontend
- React
- Vite
- HTML5
- CSS3
- Axios

### Backend
- FastAPI
- Python
- Pydantic
- gTTS
- PyPDF2
- python-docx
- Pillow
- Tesseract OCR

### Translation Engine
- LibreTranslate
- Argos Translate
- Docker

---

## 📁 Project Structure

