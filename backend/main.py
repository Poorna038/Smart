from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from gtts import gTTS
from docx import Document
import io
import httpx
import uuid
import fitz
import pytesseract
from PIL import Image

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smartlingua.netlify.app"],
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

# ---------------- HEALTH ----------------
@app.get("/")
def root():
    return {"status": "SmartLingua backend running 🚀"}

# ---------------- TEXT TO SPEECH ----------------
@app.post("/text-to-speech")
def text_to_speech(data: TTSRequest):
    filename = f"{uuid.uuid4()}.mp3"
    gTTS(text=data.text, lang=data.lang).save(filename)
    return {"audio": filename}

@app.get("/audio/{filename}")
def get_audio(filename: str):
    return FileResponse(filename, media_type="audio/mpeg")

# ---------------- TEXT TRANSLATION (MyMemory – FIXED) ----------------
@app.post("/translate")
async def translate_text(data: TranslateRequest):
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.get(
                "https://api.mymemory.translated.net/get",
                params={
                    "q": data.text,
                    # IMPORTANT: source MUST be explicit
                    "langpair": f"en|{data.target}",
                    "de": "smartlingua@example.com"
                }
            )

        result = res.json()
        translated = result.get("responseData", {}).get("translatedText", "")

        if not translated:
            return {"error": "Translation failed"}

        return {"translated": translated}

    except Exception as e:
        return {"error": "Translation service unavailable"}

# ---------------- DOCUMENT TRANSLATION ----------------
@app.post("/translate-document")
async def translate_document(
    file: UploadFile = File(...),
    target: str = Form(...)
):
    text = ""

    if file.filename.endswith(".txt"):
        content = await file.read()
        text = content.decode("utf-8")

    elif file.filename.endswith(".docx"):
        doc = Document(file.file)
        text = "\n".join(p.text for p in doc.paragraphs)

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

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.get(
                "https://api.mymemory.translated.net/get",
                params={
                    "q": text,
                    "langpair": f"en|{target}",
                    "de": "smartlingua@example.com"
                }
            )

        result = res.json()
        translated = result.get("responseData", {}).get("translatedText", "")

        if not translated:
            return {"error": "Document translation failed"}

        return {"translated": translated}

    except Exception:
        return {"error": "Document translation failed"}
