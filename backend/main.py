from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from gtts import gTTS
from docx import Document
import io
import httpx
import uuid
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import os

app = FastAPI()

# ---------------- CORS (NETLIFY FRONTEND) ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartlingua.netlify.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONSTANTS ----------------

LIBRE_TRANSLATE_URL = "https://libretranslate.de/translate"

# ---------------- MODELS ----------------

class TTSRequest(BaseModel):
    text: str
    lang: str = "en"

class TranslateRequest(BaseModel):
    text: str
    target: str

# ---------------- HEALTH CHECK ----------------

@app.get("/")
def root():
    return {"status": "Backend running fine on Render 🚀"}

# ---------------- TEXT TO SPEECH ----------------

@app.post("/text-to-speech")
def text_to_speech(data: TTSRequest):
    filename = f"{uuid.uuid4()}.mp3"
    gTTS(text=data.text, lang=data.lang).save(filename)
    return {"audio": filename}

@app.get("/audio/{filename}")
def get_audio(filename: str):
    return FileResponse(filename, media_type="audio/mpeg")

# ---------------- TEXT TRANSLATION ----------------

@app.post("/translate")
async def translate_text(data: TranslateRequest):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            LIBRE_TRANSLATE_URL,
            json={
                "q": data.text,
                "source": "auto",
                "target": data.target,
                "format": "text"
            }
        )

    try:
        result = response.json()
        return {"translated": result["translatedText"]}
    except Exception:
        return {"translated": "", "error": "Translation failed"}

# ---------------- DOCUMENT TRANSLATION ----------------

@app.post("/translate-document")
async def translate_document(
    file: UploadFile = File(...),
    target: str = Form(...)
):
    text = ""

    # ---------- TXT ----------
    if file.filename.endswith(".txt"):
        content = await file.read()
        text = content.decode("utf-8")

    # ---------- DOCX ----------
    elif file.filename.endswith(".docx"):
        doc = Document(file.file)
        text = "\n".join(p.text for p in doc.paragraphs)

    # ---------- PDF ----------
    elif file.filename.endswith(".pdf"):
        pdf_data = await file.read()
        pdf = fitz.open(stream=pdf_data, filetype="pdf")

        for page in pdf:
            page_text = page.get_text()
            if page_text.strip():
                text += page_text
            else:
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text += pytesseract.image_to_string(img)

    else:
        return {"error": "Unsupported file format"}

    if not text.strip():
        return {"error": "No readable text found"}

    # ---------- TRANSLATE ----------
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            LIBRE_TRANSLATE_URL,
            json={
                "q": text,
                "source": "auto",
                "target": target,
                "format": "text"
            }
        )

    result = response.json()
    return {"translated": result.get("translatedText", "")}
