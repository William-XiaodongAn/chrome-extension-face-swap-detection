from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64, io, uuid, requests
from pathlib import Path
import tempfile
import os
import json
from sshtunnel import SSHTunnelForwarder

app = FastAPI()

# Allow frontend from anywhere (or restrict to your extension origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Frame(BaseModel):
    image: str  # base64 image string

# SSH and ML server config
LINUX_SERVER_IP = "99.92.208.110"
LINUX_SERVER_PORT = 5001
SSH_PORT = 2222
SSH_USERNAME = "xiaodongan"
SSH_PASSWORD = "123"  # For production, use SSH keys!

@app.post("/score")
def score_face(frame: Frame):
    try:
        # Save base64 image to temporary file
        img_bytes = base64.b64decode(frame.image.split(",")[1])
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(img_bytes)
            temp_file_path = temp_file.name

        # Create SSH tunnel and forward a local port to the remote ML server's localhost:5001
        with SSHTunnelForwarder(
            (LINUX_SERVER_IP, SSH_PORT),
            ssh_username=SSH_USERNAME,
            ssh_password=SSH_PASSWORD,
            remote_bind_address=('127.0.0.1', LINUX_SERVER_PORT)
        ) as tunnel:
            local_port = tunnel.local_bind_port
            url = f"http://127.0.0.1:{local_port}/predict"
            headers = {"x-api-key": "test123"}
            with open(temp_file_path, 'rb') as f:
                files = {'file': (os.path.basename(temp_file_path), f, 'image/jpeg')}
                response = requests.post(url, headers=headers, files=files)

        os.unlink(temp_file_path)

        if response.status_code == 200:
            response_data = response.json()
            blended_score = None
            if 'faces' in response_data and len(response_data['faces']) > 0:
                blended_score = response_data['faces'][0].get('blended_fakeness_score')
            return {
                "blended_fakeness_score": blended_score,
                "full_response": response_data
            }
        else:
            return {
                "error": f"Server returned status code {response.status_code}",
                "response": response.text
            }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
