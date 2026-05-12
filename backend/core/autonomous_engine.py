import asyncio
import random
from typing import List, Dict, Any

class AutonomousEngine:
    def __init__(self):
        self.current_task = None
        self.task_name = ""
        self.logs_buffer: List[str] = []
        self.is_running = False

    async def _run_loop(self):
        counter = 1
        code_snippets = [
            "import os\ndef secure_system():\n    os.system('cls')",
            "const decrypt = (data) => data.split('').reverse().join('');",
            "body { background: #000; color: #0f0; font-family: monospace; }",
            "<html><head><title>CORE_ACCESS</title></head></html>",
            "def neural_link():\n    return [x**2 for x in range(10)]",
            "fetch('/api/v1/ultron/status').then(r => r.json());",
            "git commit -m 'feat: neural-optimization-complete'"
        ]
        
        while self.is_running:
            # Simulate actual work based on task name
            if any(x in self.task_name.lower() for x in ["coding", "develop", "program", "build", "defense"]):
                snippet = random.choice(code_snippets)
                log_entry = f"[{self.task_name.upper()} LOG] - Generating Segment {counter}:\n```\n{snippet}\n```"
            else:
                log_entry = f"[{self.task_name.upper()} PROTOCOL] - Iteration {counter}: Scanning vectors... Status Nominal."
            
            self.logs_buffer.append(log_entry)
            counter += 1
            await asyncio.sleep(30) # Emit every 30 seconds to keep it active but not irritating

    def start_task(self, task_name: str) -> str:
        if self.is_running:
            return f"Task '{self.task_name}' is already running. Please stop it first."
        
        self.task_name = task_name
        self.is_running = True
        self.current_task = asyncio.create_task(self._run_loop())
        return f"Autonomous Task '{task_name}' initialized. Running in background."

    def stop_task(self) -> str:
        if not self.is_running:
            return "No active autonomous tasks to stop."
        
        self.is_running = False
        if self.current_task:
            self.current_task.cancel()
        
        stopped_name = self.task_name
        self.task_name = ""
        self.logs_buffer.append(f"[{stopped_name.upper()} PROTOCOL] - TERMINATED BY USER.")
        return f"Autonomous Task '{stopped_name}' has been successfully terminated."

    def get_new_logs(self) -> List[str]:
        logs = self.logs_buffer.copy()
        self.logs_buffer.clear()
        return logs

autonomous_agent = AutonomousEngine()
