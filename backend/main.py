from fastapi import FastAPI , UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from gtts import gTTS
from docx import Document
from PyPDF2 import PdfReader
import io
import httpx
import uuid
import fitz
import pytesseract
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODELS ----------------

class TTSRequest(BaseModel):
    text: str
    lang: str = "en"

class TranslateRequest(BaseModel):
    text: str
    target: str

# ---------------- TEXT TO SPEECH ----------------

@app.post("/text-to-speech")
def text_to_speech(data: TTSRequest):
    filename = f"{uuid.uuid4()}.mp3"
    gTTS(text=data.text, lang=data.lang).save(filename)
    return {"audio": filename}

@app.get("/audio/{filename}")
def get_audio(filename: str):
    return FileResponse(filename, media_type="audio/mpeg")

# ---------------- TRANSLATION (SAFE + STABLE) ----------------

@app.post("/translate")
async def translate_text(data: TranslateRequest):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "http://localhost:5000/translate",
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
        return {
            "translated": "",
            "error": "LibreTranslate did not respond"
        }

# ---------------- HEALTH CHECK ----------------

@app.get("/")
def root():
    return {"status": "Backend running fine on Python 3.13 🚀"}


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

            # If text exists → normal PDF
            if page_text.strip():
                text += page_text
            else:
                # OCR for scanned PDF
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text += pytesseract.image_to_string(img)

    else:
        return {"error": "Unsupported file format"}

    if not text.strip():
        return {"error": "No readable text found in document"}

    # ---------- TRANSLATE ----------
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "http://127.0.0.1:5000/translate",
            json={
                "q": text,
                "source": "auto",
                "target": target,
                "format": "text"
            }
        )

    result = response.json()
    return {"translated": result.get("translatedText", "")}