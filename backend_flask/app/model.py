# model.py
import os
import torch
import torch.nn as nn 
import torchvision.models as models
import torchvision.transforms as T
import cv2
from PIL import Image

LABEL_TO_IDX = {"dry": 0, "normal": 1, "oily": 2}
IDX_TO_LABEL = {v: k for k, v in LABEL_TO_IDX.items()}

IMG_SIZE = 224
val_transform = T.Compose([
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225])
])

device = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "skin_type_model2.pth")

def load_model():
    try:
        resnet = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
        
        num_features = resnet.fc.in_features
        
        resnet.fc = nn.Sequential(
    nn.Dropout(0.4),
    nn.Linear(resnet.fc.in_features, len(LABEL_TO_IDX))
)

        
        model = resnet.to(device)

        state_dict = torch.load(MODEL_PATH, map_location=device)
        
        model.load_state_dict(state_dict, strict=False)  

        model.eval()

        print(f"Loaded model from: {MODEL_PATH}")
        return model

    except Exception as e:
        print("Failed to load model.")
        print(e)
        return None

model_base = load_model()

def predict_skin_type(image_bgr):
    """
    Takes a BGR image (as from OpenCV), returns predicted skin type: "dry", "normal", or "oily"
    """
    if model_base is None:
        return "Model couldn't load"

    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    tensor_input = val_transform(pil_img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model_base(tensor_input)
        _, preds = torch.max(output, 1)
        label_idx = preds.item()
        return IDX_TO_LABEL.get(label_idx, "unknown")
'''
# Optional test
if __name__ == "__main__":
    print("Testing model with placeholder image...")
    dummy_img = cv2.imread("dry.jpg")
    if dummy_img is not None:
        print("Prediction:", predict_skin_type(dummy_img))
    else:
        print("No test image found.")
'''


'''
import os
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as T
import cv2
from PIL import Image

# Label mappings
LABEL_TO_IDX = {"dry": 0, "normal": 1, "oily": 2}
IDX_TO_LABEL = {v: k for k, v in LABEL_TO_IDX.items()}

# Image size and transforms
IMG_SIZE = 224
val_transform = T.Compose([
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225])
])

# Device setup
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "skin_type_model2.pth")

# Load the model
def load_model():
    try:
        model = models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1)
        num_features = model.classifier[1].in_features

        model.classifier = nn.Sequential(
            nn.Dropout(p=0.5),
            nn.Linear(num_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(128, 3)
        )

        model = model.to(device)

        state_dict = torch.load(MODEL_PATH, map_location=device)
        model.load_state_dict(state_dict)
        model.eval()

        print(f"Loaded model from: {MODEL_PATH}")
        return model

    except Exception as e:
        print("Failed to load model.")
        print(e)
        return None

# Load once
model_base = load_model()

# Prediction function
def predict_skin_type(image_bgr):
    """
    Takes a BGR image (as from OpenCV), returns predicted skin type: "dry", "normal", or "oily"
    """
    if model_base is None:
        return "model couldn't load"

    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)

    # Preprocess image
    tensor_input = val_transform(pil_img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model_base(tensor_input)
        _, preds = torch.max(output, 1)
        label_idx = preds.item()
        return IDX_TO_LABEL.get(label_idx, "unknown")

# Optional test
if __name__ == "__main__":
    print("Testing model with placeholder image...")
    dummy_img = cv2.imread("oily.jpg")
    if dummy_img is not None:
        print("Prediction:", predict_skin_type(dummy_img))
    else:
        print("No test image found.")
'''