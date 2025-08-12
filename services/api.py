from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List
import uvicorn
from pathlib import Path

try:
    from ultralytics import YOLO
except Exception:
    YOLO = None

app = FastAPI(title="Parking & Pavement Inference API")

# Lazy model loading; set your trained weights here
PARKING_MODEL_PATH = Path("/workspace/models/parking_yolov8n.pt")
PAVEMENT_MODEL_PATH = Path("/workspace/models/pavement_yolov8n_seg.pt")

_parking_model = None
_pavement_model = None


def get_parking_model():
    global _parking_model
    if _parking_model is None and YOLO is not None and PARKING_MODEL_PATH.exists():
        _parking_model = YOLO(str(PARKING_MODEL_PATH))
    return _parking_model


def get_pavement_model():
    global _pavement_model
    if _pavement_model is None and YOLO is not None and PAVEMENT_MODEL_PATH.exists():
        _pavement_model = YOLO(str(PAVEMENT_MODEL_PATH))
    return _pavement_model


@app.post("/parking/detect")
async def parking_detect(file: UploadFile = File(...)):
    model = get_parking_model()
    if model is None:
        return JSONResponse({"error": "Parking model not available"}, status_code=503)
    img_bytes = await file.read()
    results = model(img_bytes)
    det = results[0]
    boxes = det.boxes.xyxy.cpu().tolist() if det.boxes is not None else []
    cls = det.boxes.cls.cpu().tolist() if det.boxes is not None else []
    conf = det.boxes.conf.cpu().tolist() if det.boxes is not None else []
    return {"boxes": boxes, "classes": cls, "conf": conf}


@app.post("/pavement/segment")
async def pavement_segment(file: UploadFile = File(...)):
    model = get_pavement_model()
    if model is None:
        return JSONResponse({"error": "Pavement model not available"}, status_code=503)
    img_bytes = await file.read()
    results = model(img_bytes)
    seg = results[0]
    masks = seg.masks.data.cpu().numpy().tolist() if getattr(seg, "masks", None) is not None else []
    boxes = seg.boxes.xyxy.cpu().tolist() if seg.boxes is not None else []
    cls = seg.boxes.cls.cpu().tolist() if seg.boxes is not None else []
    conf = seg.boxes.conf.cpu().tolist() if seg.boxes is not None else []
    return {"masks": masks, "boxes": boxes, "classes": cls, "conf": conf}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)