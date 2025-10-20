from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from pathlib import Path
from PIL import Image
import pytesseract
import io, os, json
from dotenv import load_dotenv
from openai import OpenAI

router = APIRouter()

@router.get("/image-processing")
async def root():
    return {"message": "Image Processing API is running"}

class ImageDetection:
    def __init__(self, collection):
        self.collection = collection
        load_dotenv()
        key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=key) if key else None

    async def reorganize(self, upload_file: UploadFile, system_data: dict):
        # 0) Read bytes (works whether it's really a file or an UploadFile)
        try:
            contents = await upload_file.read()
        finally:
            # make re-reads possible for caller if needed
            try:
                upload_file.file.seek(0)
            except Exception:
                pass

        # 1) OCR (non-fatal)
        ocr_text = ""
        try:
            image = Image.open(io.BytesIO(contents))
            ocr_text = pytesseract.image_to_string(image, lang="eng") or ""
            print(f"🧾 OCR chars: {len(ocr_text)}")
        except Exception as e:
            print(f"⚠️ OCR failed (continuing): {e}")

        # 2) LLM structuring (non-fatal; skipped if no key)
        parsed_json = {"products": {}, "raw_ocr_text": ocr_text or None}
        if self.client:
            try:
                prompt = f"""
You are a data parser that extracts structured information from messy OCR text.

OCR:
---
{ocr_text}
---

Return strictly JSON with this shape:

{{
  "products": {{
    "product_name_1": {{
      "pick_up_time": null,
      "drop_off_location": null,
      "drop_off_time": null,
      "pick_up_location": "{system_data.get("pick_up_location")}",
      "quantity": null,
      "price": null
    }}
  }}
}}
"""
                resp = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a structured data extraction assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1
                )
                structured_data = resp.choices[0].message.content.strip()
                if structured_data.startswith("```json"):
                    structured_data = structured_data[7:-3].strip()
                elif structured_data.startswith("```"):
                    structured_data = structured_data[3:-3].strip()
                parsed_json = json.loads(structured_data)
                print("🤖 LLM JSON parsed OK")
            except Exception as e:
                print(f"⚠️ OpenAI step failed (continuing): {e}")

        # 3) Optional: write local JSON (non-fatal)
        try:
            with open("formatted_output.json", "w") as f:
                json.dump(parsed_json, f, indent=2)
            print("📝 Wrote formatted_output.json")
        except Exception as e:
            print(f"⚠️ Could not write formatted_output.json: {e}")

        # 4) Insert into Mongo (ALWAYS attempt if collection exists)
        inserted_id = None
        if self.collection is not None:
            try:
                doc = {
                    "user_info": system_data,
                    "original_filename": upload_file.filename,
                    "structured_data": parsed_json,
                }
                res = self.collection.insert_one(doc)
                inserted_id = str(res.inserted_id)
                print(f"✅ Mongo insert into {self.collection.database.name}.{self.collection.name} _id={inserted_id}")
            except Exception as e:
                print(f"❌ Mongo insert failed: {e}")
        else:
            print("⚠️ No Mongo collection provided; skipping insert")

        return {"inserted_id": inserted_id, "structured_data": parsed_json}

@router.post("/process-image")
async def process_image(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = "default_user",
    user_name: str = "default_name",
    pick_up_location: str = "default_location"
):
    try:
        # Get DB from app state (must be set at startup)
        database = request.app.state.db     # e.g., BFB
        collection = database["chatbot"]    # <- make sure you look at BFB.chatbot in Atlas

        print(f"🔌 Writing to DB: {database.name}, collection: {collection.name}")

        image_processor = ImageDetection(collection)
        system_data = {
            "user_id": user_id,
            "user_name": user_name,
            "pick_up_location": pick_up_location
        }
        result = await image_processor.reorganize(file, system_data)
        return {
            "status": "success",
            "message": "Processed",
            "inserted_id": result.get("inserted_id"),
            "filename": file.filename,
            "data": result.get("structured_data")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")
