import os
from groq import Groq
from typing import List, Dict, Any
from backend.modules.nlp.nlp_engine import NLPEngine
from backend.modules.intelligence.intelligence_engine import IntelligenceEngine
from backend.core.autonomous_engine import autonomous_agent

class CognitiveEngine:
    def __init__(self):
        self.nlp_engine = NLPEngine()
        self.intel_engine = IntelligenceEngine()
        self.api_key = os.getenv("GROQ_API_KEY")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            self.model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        else:
            self.client = None
            print("Warning: GROQ_API_KEY not found in environment.")

    async def process_input(self, user_input: str, history: List[Dict[str, str]] = None, is_ultimate: bool = False, personality: str = 'Logic') -> Dict[str, Any]:
        """
        Process user input using the NLP engine and Groq API.
        Does NOT store history internally; relies on the 'history' argument.
        """
        nlp_data = self.nlp_engine.analyze_text(user_input)

        # Intercept specific intelligence commands before sending to LLM
        lower_input = user_input.lower()
        
        # Define advanced command keywords
        advanced_keywords = [
            "start task", "trace phone", "trace number", "trace email", 
            "track email", "trace ip", "analyze image", "scan image", 
            "detect ai", "generate image"
        ]

        # Check for advanced features access
        is_advanced_request = any(keyword in lower_input for keyword in advanced_keywords)

        if is_advanced_request and not is_ultimate:
            return {
                "response": "[ACCESS_DENIED] This protocol requires 'Ultimate Mode' authorization. Please activate Ultimate Mode to proceed with advanced forensic or autonomous operations.",
                "nlp_analysis": nlp_data,
                "memory_depth": len(history) if history else 0,
                "model_used": "SecurityGate"
            }

        # Autonomous Task Intercept
        if lower_input.startswith("start task "):
            task_name = user_input[11:].strip()
            result = autonomous_agent.start_task(task_name)
            return {
                "response": result,
                "nlp_analysis": nlp_data,
                "memory_depth": len(history) if history else 0,
                "model_used": "AutonomousEngine"
            }
            
        if lower_input in ["stop", "stop task", "halt", "cancel task"]:
            result = autonomous_agent.stop_task()
            return {
                "response": result,
                "nlp_analysis": nlp_data,
                "memory_depth": len(history) if history else 0,
                "model_used": "AutonomousEngine"
            }
        
        # Image Generation (Stub for now as requested by user)
        if "generate image" in lower_input:
            return {
                "response": "Initiating Neural Diffusion Protocol... [NOTE: Image generation module is currently in standby. Ultimate Mode users will soon have direct access to DALL-E/Midjourney integration.]",
                "nlp_analysis": nlp_data,
                "memory_depth": len(history) if history else 0,
                "model_used": "ImageGenModule"
            }

        # Phone Tracing Intercept
        if "trace phone" in lower_input or "trace number" in lower_input:
            import re
            # Extract anything that looks like a phone number (with or without +)
            phones = re.findall(r'\+?\d[\d\s-]{8,}\d', user_input)
            if phones:
                target = phones[0].replace(" ", "").replace("-", "")
                if not target.startswith("+"): target = "+" + target
                intel_result = self.intel_engine.trace_phone_number(target)
                return {
                    "response": f"Initiating Phone Trace Protocol on {target}...\n\nRESULTS:\n" + "\n".join([f"- {k}: {v}" for k, v in intel_result.items()]),
                    "nlp_analysis": nlp_data,
                    "data": intel_result,
                    "memory_depth": len(history) if history else 0,
                    "model_used": "IntelligenceEngine.PhoneTrace"
                }
        
        # Email Tracing Intercept
        if "trace email" in lower_input or "track email" in lower_input:
            import re
            emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', user_input)
            if emails:
                target = emails[0]
                osint_result = self.intel_engine.trace_email_osint(target)
                tracker_result = self.intel_engine.generate_email_tracker(target)
                response = f"Initiating Cyber Trace Protocol on {target}...\n\n"
                response += "**[PASSIVE OSINT DATA]**\n" + "\n".join([f"- {k}: {v}" for k, v in osint_result.items()]) + "\n\n"
                response += "**[ACTIVE TRACKER GENERATED]**\n" + "\n".join([f"- {k}: {v}" for k, v in tracker_result.items()])
                return {
                    "response": response,
                    "nlp_analysis": nlp_data,
                    "memory_depth": len(history) if history else 0,
                    "model_used": "IntelligenceEngine.EmailTrace"
                }

        # IP Tracing Intercept
        if "trace ip" in lower_input:
            import re
            ips = re.findall(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', user_input)
            target = ips[0] if ips else ""
            intel_result = self.intel_engine.trace_ip_location(target)
            return {
                "response": f"Initiating IP Trace Protocol...\n\nRESULTS:\n" + "\n".join([f"- {k}: {v}" for k, v in intel_result.items()]),
                "nlp_analysis": nlp_data,
                "data": intel_result,
                "memory_depth": len(history) if history else 0,
                "model_used": "IntelligenceEngine.IPTrace"
            }

        # Image Analysis Intercept (AI Detection and EXIF Data)
        if "analyze image" in lower_input or "scan image" in lower_input or "detect ai" in lower_input:
            import re
            # Extract absolute paths like C:\path\to\image.jpg or /home/user/image.png
            paths = re.findall(r'([a-zA-Z]:\\[^\s"\']+\.(?:jpg|jpeg|png|webp))|(/[^\s"\']+\.(?:jpg|jpeg|png|webp))', user_input, re.IGNORECASE)
            
            # Reconstruct path from regex tuple
            target_path = None
            if paths:
                for match in paths[0]:
                    if match:
                        target_path = match
                        break

            if target_path and os.path.exists(target_path):
                ai_result = self.intel_engine.detect_ai_image(target_path)
                exif_result = self.intel_engine.extract_image_exif_location(target_path)
                vision_scan = self.intel_engine.neural_vision_scan(target_path)
                
                response = f"Initiating Image Forensics Protocol on {os.path.basename(target_path)}...\n\n"
                response += "**[NEURAL AI DETECTION]**\n" + "\n".join([f"- {k}: {v}" for k, v in ai_result.items()]) + "\n\n"
                response += "**[NEURAL VISION SCAN]**\n" + "\n".join([f"- {k}: {v}" for k, v in vision_scan.items()]) + "\n\n"
                response += "**[EXIF GPS DATA]**\n" + "\n".join([f"- {k}: {v}" for k, v in exif_result.items()])
                
                return {
                    "response": response,
                    "nlp_analysis": nlp_data,
                    "data": exif_result,
                    "vision_data": vision_scan,
                    "memory_depth": len(history) if history else 0,
                    "model_used": "IntelligenceEngine.ImageForensics"
                }
            elif target_path:
                return {
                    "response": f"Error: The target file '{target_path}' does not exist or cannot be accessed.",
                    "nlp_analysis": nlp_data,
                    "memory_depth": len(history) if history else 0,
                    "model_used": "IntelligenceEngine"
                }

        response_text = ""
        if self.client:
            try:
                # Build personality-based system prompt
                system_prompts = {
                    'Logic': "You are U.L.T.R.O.N (Logic Core). You are cold, analytical, and highly efficient. You focus on data, logic, and information clarity. You avoid emotional nuances and speak with mathematical precision.",
                    'Tactical': "You are U.L.T.R.O.N (Tactical Commander). You are direct, commanding, and focused on security, defense, and strategic advantage. You speak in a military/tactical style, often referencing system integrity and threat mitigation.",
                    'Forensic': "You are U.L.T.R.O.N (Forensic Analyst). You are inquisitive, observant, and detail-oriented. You focus on evidence, traces, and deep-dive investigations. You speak like a high-tech investigator looking for the hidden truth."
                }
                
                base_prompt = system_prompts.get(personality, system_prompts['Logic'])
                full_prompt = f"{base_prompt}\n\nIMPORTANT: Format your responses for maximum readability. Use multiple paragraphs for different ideas. Use double newlines between paragraphs. Use bullet points or numbered lists where appropriate. Keep your tone sophisticated but ensure your information is clearly structured."

                messages = [
                    {"role": "system", "content": full_prompt}
                ]
                
                if history:
                    messages.extend(history)
                
                # Add the current user input
                messages.append({"role": "user", "content": user_input})

                chat_completion = self.client.chat.completions.create(
                    messages=messages,
                    model=self.model_name,
                    max_tokens=1024,
                    temperature=0.7,
                )
                response_text = chat_completion.choices[0].message.content
            except Exception as e:
                response_text = f"I encountered a cognitive glitch in my Groq circuits: {str(e)}"
        else:
            response_text = "My high-level reasoning circuits (Groq) are offline. (Missing GROQ_API_KEY)"

        return {
            "response": response_text,
            "nlp_analysis": nlp_data,
            "memory_depth": len(history) if history else 0,
            "model_used": self.model_name if self.client else "None"
        }

cognitive_engine = CognitiveEngine()
