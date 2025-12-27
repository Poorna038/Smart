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

app = FastAPI()

# ---------------- CORS ----------------
# Allow Netlify frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartlingua.netlify.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- TRANSLATION FALLBACK SERVERS ----------------
LIBRE_TRANSLATE_URLS = [
    "https://translate.astian.org/translate",
    "https://libretranslate.com/translate",
    "https://libretranslate.de/translate"
]

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
    return {"status": "SmartLingua backend running on Render 🚀"}

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
    for url in LIBRE_TRANSLATE_URLS:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(
                    url,
                    json={
                        "q": data.text,
                        "source": "auto",
                        "target": data.target,
                        "format": "text"
                    }
                )

            if response.status_code == 200:
                result = response.json()
                if "translatedText" in result:
                    return {"translated": result["translatedText"]}

        except Exception:
            continue

    return {"error": "Translation service unavailable. Please try again later."}

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
        return {"error": "No readable text found in document"}

    # ---------- TRANSLATE WITH FALLBACK ----------
    for url in LIBRE_TRANSLATE_URLS:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    url,
                    json={
                        "q": text,
                        "source": "auto",
                        "target": target,
                        "format": "text"
                    }
                )

            if response.status_code == 200:
                result = response.json()
                if "translatedText" in result:
                    return {"translated": result["translatedText"]}

        except Exception:
            continue

    return {"error": "Document translation failed. Try again later."}
