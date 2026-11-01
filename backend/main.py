from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from gtts import gTTS
from docx import Document

import io
import os
import uuid
import httpx
import fitz
import pytesseract

from PIL import Image


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="SmartLingua API",
    description="SmartLingua Translation and Text-to-Speech API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://smartlingua.netlify.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# DIRECTORIES
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

AUDIO_DIR = os.path.join(
    BASE_DIR,
    "audio"
)

os.makedirs(
    AUDIO_DIR,
    exist_ok=True
)


# ============================================================
# LANGUAGE CODES
# ============================================================

LANGUAGE_CODES = {

    # Indian languages
    "English": "en",
    "Hindi": "hi",
    "Kannada": "kn",
    "Tamil": "ta",
    "Telugu": "te",
    "Malayalam": "ml",
    "Bengali": "bn",
    "Marathi": "mr",
    "Gujarati": "gu",
    "Punjabi": "pa",
    "Urdu": "ur",

    # European languages
    "French": "fr",
    "Spanish": "es",
    "German": "de",
    "Italian": "it",
    "Portuguese": "pt",
    "Russian": "ru",

    # Asian languages
    "Japanese": "ja",
    "Korean": "ko",
    "Chinese": "zh-CN",
}


# ============================================================
# MODELS
# ============================================================

class TTSRequest(BaseModel):

    text: str

    lang: str = "en"


class TranslateRequest(BaseModel):

    text: str

    target: str


# ============================================================
# LANGUAGE HELPER
# ============================================================

def get_language_code(language: str) -> str:

    """
    Converts language name to language code.

    Example:

    French -> fr
    Hindi -> hi
    Kannada -> kn

    If the frontend already sends a code,
    it returns the code directly.
    """

    if not language:
        return "en"

    language = language.strip()

    # Already a language code
    if language in LANGUAGE_CODES.values():
        return language

    # Language name
    if language in LANGUAGE_CODES:
        return LANGUAGE_CODES[language]

    # Case-insensitive lookup
    for name, code in LANGUAGE_CODES.items():

        if name.lower() == language.lower():
            return code

    # Fallback
    return language.lower()


# ============================================================
# ROOT / HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "status": "SmartLingua backend running 🚀"
    }


@app.get("/health")
def health():

    return {
        "success": True,
        "message": "SmartLingua API is healthy"
    }


# ============================================================
# TEXT TRANSLATION HELPER
# ============================================================

async def translate_with_mymemory(
    text: str,
    target: str
):

    target_code = get_language_code(
        target
    )

    print("--------------------------------")
    print("Translation request")
    print("Text length:", len(text))
    print("Target:", target)
    print("Target code:", target_code)
    print("--------------------------------")

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(

            "https://api.mymemory.translated.net/get",

            params={
                "q": text,
                "langpair": f"en|{target_code}",
            }
        )

    print(
        "MyMemory status:",
        response.status_code
    )

    print(
        "MyMemory response:",
        response.text[:1000]
    )

    if response.status_code != 200:

        raise Exception(
            f"MyMemory API returned "
            f"{response.status_code}"
        )

    result = response.json()

    translated = (
        result
        .get("responseData", {})
        .get("translatedText", "")
    )

    if not translated:

        raise Exception(
            f"No translation returned: {result}"
        )

    return translated


# ============================================================
# TEXT TRANSLATION
# ============================================================

@app.post("/translate")
async def translate_text(
    data: TranslateRequest
):

    try:

        if not data.text.strip():

            return {
                "success": False,
                "error": "Text cannot be empty"
            }

        if not data.target:

            return {
                "success": False,
                "error": "Target language is required"
            }

        translated = await translate_with_mymemory(
            data.text,
            data.target
        )

        return {

            "success": True,

            "translated": translated,

            "result": translated,

            "target": get_language_code(
                data.target
            )
        }

    except Exception as e:

        print(
            "TRANSLATION ERROR:",
            str(e)
        )

        return {

            "success": False,

            "error": "Translation failed",

            "details": str(e)
        }


# ============================================================
# TEXT TO SPEECH
# ============================================================

@app.post("/text-to-speech")
def text_to_speech(
    data: TTSRequest
):

    try:

        print("================================")
        print("TEXT TO SPEECH REQUEST")
        print("Text:", data.text)
        print("Language received:", data.lang)
        print("================================")

        # ----------------------------------------------------
        # Check text
        # ----------------------------------------------------

        if not data.text.strip():

            return {
                "success": False,
                "error": "Text is required"
            }


        # ----------------------------------------------------
        # Convert language
        # ----------------------------------------------------

        language_code = get_language_code(
            data.lang
        )

        print(
            "Language code:",
            language_code
        )


        # ----------------------------------------------------
        # Generate filename
        # ----------------------------------------------------

        filename = (
            f"{uuid.uuid4()}.mp3"
        )

        filepath = os.path.join(
            AUDIO_DIR,
            filename
        )


        # ----------------------------------------------------
        # Generate speech
        # ----------------------------------------------------

        print(
            "Generating audio..."
        )

        tts = gTTS(

            text=data.text,

            lang=language_code
        )

        tts.save(filepath)


        # ----------------------------------------------------
        # Check file
        # ----------------------------------------------------

        if not os.path.exists(filepath):

            raise Exception(
                "Audio file was not created"
            )


        print(
            "Audio created:",
            filepath
        )


        # ----------------------------------------------------
        # Return filename
        # ----------------------------------------------------

        return {

            "success": True,

            "audio": filename,

            "filename": filename,

            "language": language_code,

            "message": "Speech generated successfully"
        }


    except Exception as e:

        print(
            "TTS ERROR:",
            repr(e)
        )

        return {

            "success": False,

            "error": "Speech generation failed",

            "details": str(e)
        }


# ============================================================
# SERVE AUDIO FILE
# ============================================================

@app.get("/audio/{filename}")
def get_audio(
    filename: str
):

    filepath = os.path.join(
        AUDIO_DIR,
        filename
    )

    # Security check
    if not os.path.abspath(filepath).startswith(
        os.path.abspath(AUDIO_DIR)
    ):

        return {
            "success": False,
            "error": "Invalid filename"
        }


    if not os.path.exists(filepath):

        return {
            "success": False,
            "error": "Audio file not found"
        }


    return FileResponse(

        filepath,

        media_type="audio/mpeg",

        filename=filename
    )


# ============================================================
# DOCUMENT TEXT EXTRACTION
# ============================================================

async def extract_document_text(
    file: UploadFile
):

    filename = (
        file.filename or ""
    ).lower()

    text = ""


    # ========================================================
    # TXT
    # ========================================================

    if filename.endswith(".txt"):

        content = await file.read()

        text = content.decode(
            "utf-8",
            errors="ignore"
        )


    # ========================================================
    # DOCX
    # ========================================================

    elif filename.endswith(".docx"):

        content = await file.read()

        doc = Document(
            io.BytesIO(content)
        )

        paragraphs = []

        for paragraph in doc.paragraphs:

            if paragraph.text.strip():

                paragraphs.append(
                    paragraph.text
                )

        text = "\n".join(
            paragraphs
        )


    # ========================================================
    # PDF
    # ========================================================

    elif filename.endswith(".pdf"):

        pdf_data = await file.read()

        pdf = fitz.open(
            stream=pdf_data,
            filetype="pdf"
        )

        for page in pdf:

            # -----------------------------------------------
            # First try normal PDF text extraction
            # -----------------------------------------------

            page_text = page.get_text()

            if page_text.strip():

                text += (
                    page_text +
                    "\n"
                )

            else:

                # -------------------------------------------
                # If scanned PDF, use OCR
                # -------------------------------------------

                print(
                    "Running OCR on PDF page..."
                )

                pix = page.get_pixmap()

                img = Image.open(
                    io.BytesIO(
                        pix.tobytes("png")
                    )
                )

                ocr_text = (
                    pytesseract.image_to_string(
                        img
                    )
                )

                text += (
                    ocr_text +
                    "\n"
                )

        pdf.close()


    # ========================================================
    # UNSUPPORTED
    # ========================================================

    else:

        raise Exception(
            "Unsupported file format. "
            "Use TXT, DOCX or PDF."
        )


    return text.strip()


# ============================================================
# DOCUMENT TRANSLATION
# ============================================================

@app.post("/translate-document")
async def translate_document(

    file: UploadFile = File(...),

    target: str = Form(...)
):

    try:

        print("================================")
        print("DOCUMENT TRANSLATION")
        print("Filename:", file.filename)
        print("Target:", target)
        print("================================")


        # ----------------------------------------------------
        # Extract text
        # ----------------------------------------------------

        text = await extract_document_text(
            file
        )


        if not text.strip():

            return {

                "success": False,

                "error":
                    "No readable text found"
            }


        print(
            "Extracted text length:",
            len(text)
        )


        # ----------------------------------------------------
        # Split into chunks
        # ----------------------------------------------------

        chunk_size = 1800

        chunks = []

        for i in range(
            0,
            len(text),
            chunk_size
        ):

            chunks.append(
                text[
                    i:i + chunk_size
                ]
            )


        print(
            "Number of chunks:",
            len(chunks)
        )


        # ----------------------------------------------------
        # Translate each chunk
        # ----------------------------------------------------

        translated_chunks = []


        for index, chunk in enumerate(
            chunks
        ):

            print(
                f"Translating chunk "
                f"{index + 1}/"
                f"{len(chunks)}"
            )


            translated = (
                await translate_with_mymemory(
                    chunk,
                    target
                )
            )


            translated_chunks.append(
                translated
            )


        # ----------------------------------------------------
        # Combine
        # ----------------------------------------------------

        translated_text = (
            "\n\n".join(
                translated_chunks
            )
        )


        return {

            "success": True,

            "translated":
                translated_text,

            "result":
                translated_text,

            "target":
                get_language_code(target)
        }


    except Exception as e:

        print(
            "DOCUMENT TRANSLATION ERROR:",
            repr(e)
        )

        return {

            "success": False,

            "error":
                "Document translation failed",

            "details":
                str(e)
        }


# ============================================================
# DELETE OLD AUDIO FILES
# ============================================================

@app.delete("/audio/{filename}")
def delete_audio(
    filename: str
):

    filepath = os.path.join(
        AUDIO_DIR,
        filename
    )

    if os.path.exists(filepath):

        os.remove(filepath)

        return {
            "success": True,
            "message": "Audio deleted"
        }

    return {

        "success": False,

        "error":
            "Audio file not found"
    }


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():

    print("================================")
    print("SmartLingua Backend Started 🚀")
    print("================================")
    print(
        "Audio directory:",
        AUDIO_DIR
    )
    print(
        "Supported languages:",
        len(LANGUAGE_CODES)
    )
    print("================================")