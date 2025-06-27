#image_quality.py
import cv2
import numpy as np

def is_blurry(image, avg_threshold=100.0, min_patch_threshold=30.0, allowed_bad_patches=1):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    patches = [
        gray[h//4:h//2, w//4:w//2],         # center
        gray[0:h//3, 0:w//3],               # top-left
        gray[0:h//3, -w//3:],               # top-right
        gray[-h//3:, 0:w//3],               # bottom-left
        gray[-h//3:, -w//3:]                # bottom-right
    ]

    variances = [cv2.Laplacian(p, cv2.CV_64F).var() for p in patches]
    avg_var = np.mean(variances)
    low_patch_count = sum(v < min_patch_threshold for v in variances)

    print(f"[DEBUG] Blur variances: {[f'{v:.2f}' for v in variances]}")
    print(f"[DEBUG] Avg blur variance: {avg_var:.2f} | Bad patches: {low_patch_count}")

    return avg_var < avg_threshold or low_patch_count > allowed_bad_patches


def is_too_dark(image, brightness_threshold=50, dark_pixel_ratio=0.6):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    h, w = gray.shape
    center = gray[h//4:h*3//4, w//4:w*3//4]

    median_brightness = np.median(center)
    std_brightness = np.std(center)
    dark_pixels = np.sum(center < 40)
    total_pixels = center.size
    ratio_dark = dark_pixels / total_pixels

    print(f"[DEBUG] Median brightness: {median_brightness:.2f}")
    print(f"[DEBUG] Brightness std deviation: {std_brightness:.2f}")
    print(f"[DEBUG] Dark pixel ratio: {ratio_dark:.2f}")

    if median_brightness < brightness_threshold and ratio_dark > dark_pixel_ratio:
        return True
    if median_brightness < brightness_threshold and std_brightness < 15:
        return True

    return False



def is_skewed(image, angle_threshold=6):
    """
    Better skew detection using morphology and contours on text lines.
    Returns True if average text angle is outside threshold.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, bin_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (30, 5))
    connected = cv2.morphologyEx(bin_img, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(connected, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    angles = []

    for cnt in contours:
        if cv2.contourArea(cnt) < 100:  
            continue
        rect = cv2.minAreaRect(cnt)
        angle = rect[-1]

        if angle < -45:
            angle = 90 + angle
        elif angle > 45:
            angle = angle - 90

        angles.append(angle)

    if not angles:
        print("No text regions found to estimate skew.")
        return False

    avg_angle = np.mean(angles)
    print(f"[DEBUG] Average text angle: {avg_angle:.2f}°")

    return abs(avg_angle) > angle_threshold


def is_low_contrast(image, std_threshold=15, patch_size=50, percent=0.6):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    center = gray[h//4:h*3//4, w//4:w*3//4]

    local_stds = []
    for y in range(0, center.shape[0] - patch_size, patch_size):
        for x in range(0, center.shape[1] - patch_size, patch_size):
            patch = center[y:y+patch_size, x:x+patch_size]
            std = np.std(patch)
            local_stds.append(std)

    low_contrast_patches = [s for s in local_stds if s < std_threshold]
    ratio_low = len(low_contrast_patches) / len(local_stds)
    print(f"[DEBUG] Low contrast patch ratio: {ratio_low:.2f}")

    return ratio_low >= percent



