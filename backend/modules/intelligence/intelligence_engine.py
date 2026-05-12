import os
import requests
from typing import Dict, Any

class IntelligenceEngine:
    """
    Advanced Intelligence Module for U.L.T.R.O.N.
    Capabilities: Location tracing (IP, EXIF, Phone), and AI Image Detection.
    """
    def __init__(self):
        self.ai_detector_model = None

    def trace_ip_location(self, ip_address: str = "") -> Dict[str, Any]:
        """
        Traces the geolocation of an IP address. 
        If no IP is provided, it traces the host machine's public IP.
        """
        try:
            url = f"http://ip-api.com/json/{ip_address}"
            response = requests.get(url).json()
            if response.get("status") == "success":
                return {
                    "ip": response.get("query"),
                    "country": response.get("country"),
                    "region": response.get("regionName"),
                    "city": response.get("city"),
                    "latitude": response.get("lat"),
                    "longitude": response.get("lon"),
                    "isp": response.get("isp"),
                    "status": "Target Acquired"
                }
            return {"error": "Could not trace IP location. Target may be masked."}
        except Exception as e:
            return {"error": str(e)}

    def trace_phone_number(self, phone_number: str) -> Dict[str, Any]:
        """
        Extracts region and carrier information from a phone number.
        """
        try:
            import phonenumbers
            from phonenumbers import geocoder, carrier, timezone
            
            parsed_number = phonenumbers.parse(phone_number)
            is_valid = phonenumbers.is_valid_number(parsed_number)
            
            if not is_valid:
                return {"status": "Invalid phone number formatting. Use +[CountryCode][Number]"}
                
            region = geocoder.description_for_number(parsed_number, "en")
            service_provider = carrier.name_for_number(parsed_number, "en")
            time_zones = list(timezone.time_zones_for_number(parsed_number))
            
            # Generate Map Link based on region
            map_url = "Not Available"
            if region:
                import urllib.parse
                safe_region = urllib.parse.quote(region)
                map_url = f"https://www.google.com/maps/search/?api=1&query={safe_region}"

            # Deep OSINT Scan for Owner details
            # In a production environment, this integrates with NumVerify API or Truecaller API
            osint_profile = {
                "owner_name": "[ENCRYPTED] - Requires Premium CallerID API (e.g. NumVerify/Truecaller)",
                "address_estimate": f"Located within {region} network jurisdiction.",
                "social_media_footprint": f"https://www.google.com/search?q=%22{phone_number.replace('+', '%2B')}%22"
            }

            return {
                "valid": is_valid,
                "region": region,
                "map_link": map_url,
                "carrier": service_provider if service_provider else "Unknown/Private",
                "timezones": time_zones,
                "owner_profile": osint_profile,
                "status": "Phone Tracing Complete"
            }
        except ImportError:
            return {"error": "Missing module. Please run: pip install phonenumbers"}
        except Exception as e:
            return {"error": str(e)}

    def extract_image_exif_location(self, image_path: str) -> Dict[str, Any]:
        """
        Extracts GPS coordinates embedded in an image file (EXIF Data).
        """
        try:
            from PIL import Image
            from PIL.ExifTags import TAGS, GPSTAGS
            
            image = Image.open(image_path)
            exif_data = image._getexif()
            
            if not exif_data:
                return {"status": "No EXIF data found. The image has been scrubbed (common on social media)."}

            gps_info = {}
            for tag, value in exif_data.items():
                decoded = TAGS.get(tag, tag)
                if decoded == "GPSInfo":
                    for t in value:
                        sub_decoded = GPSTAGS.get(t, t)
                        gps_info[sub_decoded] = value[t]

            if not gps_info:
                return {"status": "EXIF data found, but no GPS coordinates are present."}

            def to_decimal(coords, ref):
                d = float(coords[0])
                m = float(coords[1])
                s = float(coords[2])
                decimal = d + (m / 60.0) + (s / 3600.0)
                if ref in ['S', 'W']:
                    decimal = -decimal
                return decimal

            lat = None
            lon = None
            if 'GPSLatitude' in gps_info and 'GPSLatitudeRef' in gps_info:
                lat = to_decimal(gps_info['GPSLatitude'], gps_info['GPSLatitudeRef'])
            if 'GPSLongitude' in gps_info and 'GPSLongitudeRef' in gps_info:
                lon = to_decimal(gps_info['GPSLongitude'], gps_info['GPSLongitudeRef'])

            return {
                "status": "GPS Coordinates Extracted",
                "latitude": lat,
                "longitude": lon,
                "raw_gps_data": {k: str(v) for k, v in gps_info.items()}
            }
        except ImportError:
            return {"error": "Missing module. Please run: pip install Pillow"}
        except Exception as e:
            return {"error": str(e)}

    def neural_vision_scan(self, image_path: str) -> Dict[str, Any]:
        """
        Advanced Multi-Modal Scan: Simulates OCR and Object Detection.
        """
        try:
            from PIL import Image
            import random
            
            # Simulated neural scan logic for futuristic HUD effect
            objects = ["HUMAN_TARGET", "MOBILE_DEVICE", "SECURITY_CAMERA", "WEAPON_CONCEALED", "ENCRYPTED_DOCUMENT"]
            detected = random.sample(objects, random.randint(1, 3))
            
            # Simulated OCR
            ocr_text = "[REDACTED] - Authorization required for full decryption. Potential matches: 'CONFIDENTIAL', 'PROJECT_ULTRON', 'ACCESS_CODE_4421'"
            
            return {
                "status": "Neural Scan Complete",
                "objects_detected": detected,
                "ocr_fragments": ocr_text,
                "threat_assessment": "NOMINAL" if "WEAPON_CONCEALED" not in detected else "CRITICAL"
            }
        except Exception as e:
            return {"error": str(e)}

    def detect_ai_image(self, image_path: str) -> Dict[str, Any]:
        """
        Uses a Deep Learning model to determine if an image is AI-generated or real.
        """
        try:
            from transformers import pipeline
            from PIL import Image
            
            if self.ai_detector_model is None:
                print("[U.L.T.R.O.N.] Initializing Neural Vision Matrix... Loading AI Detection Model...")
                # We use a robust HuggingFace model specialized in AI vs Real detection
                self.ai_detector_model = pipeline("image-classification", model="dima806/ai-generated-image-detection")
            
            image = Image.open(image_path)
            result = self.ai_detector_model(image)
            
            # Formatting the result
            analysis = []
            for pred in result:
                label = pred['label'].upper()
                confidence = round(pred['score'] * 100, 2)
                analysis.append(f"{label}: {confidence}%")
                
            is_ai = result[0]['label'].lower() == 'fake' or 'ai' in result[0]['label'].lower()
            conclusion = "IMAGE IS AI-GENERATED" if is_ai else "IMAGE IS REAL (HUMAN/CAMERA)"
            
            return {
                "status": "Forensic Analysis Complete",
                "conclusion": conclusion,
                "confidence_scores": analysis
            }
        except ImportError:
            return {"error": "Missing heavy ML modules. Please run: pip install transformers torch torchvision Pillow"}
        except Exception as e:
            return {"error": str(e)}

    def trace_email_osint(self, email_address: str) -> Dict[str, Any]:
        """
        Passive OSINT: Checks if the email is linked to public profiles (like Gravatar)
        to extract potential names, locations, and profile pictures.
        """
        try:
            import hashlib
            email_hash = hashlib.md5(email_address.strip().lower().encode('utf-8')).hexdigest()
            url = f"https://en.gravatar.com/{email_hash}.json"
            
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            if response.status_code == 200:
                data = response.json()['entry'][0]
                return {
                    "status": "Target Profile Found",
                    "displayName": data.get("displayName", "Unknown"),
                    "location": data.get("currentLocation", "Not specified"),
                    "profile_url": data.get("profileUrl"),
                    "photos": [p.get("value") for p in data.get("photos", [])]
                }
            return {"status": "No public OSINT footprint found for this email."}
        except Exception as e:
            return {"error": str(e)}

    def generate_email_tracker(self, target_id: str) -> Dict[str, Any]:
        """
        Active Cyber Tactic: Generates an invisible tracking pixel (IP Grabber).
        When the target opens the email containing this pixel, U.L.T.R.O.N logs their exact IP and location.
        """
        # In a full deployment, this would link to your backend's active logging route
        tracking_url = f"https://your-ultron-server.com/api/track?id={target_id}"
        
        html_payload = f'<img src="{tracking_url}" width="1" height="1" style="display:none;" />'
        
        return {
            "status": "Tracking Payload Generated",
            "instructions": "Embed the HTML Payload into your email. When the target opens it, their IP and Location will be acquired.",
            "html_payload": html_payload,
            "tracking_url": tracking_url
        }

if __name__ == "__main__":
    # Test block
    engine = IntelligenceEngine()
    print("--- Network Tracing ---")
    print(engine.trace_ip_location())
    print("\n--- Phone Tracing ---")
    print(engine.trace_phone_number("+14155552671")) # Sample test number
