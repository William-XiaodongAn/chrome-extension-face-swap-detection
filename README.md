# Face Swap Detection Setup Guide

This guide will help you set up the face swap detection system on a Linux server and connect your Chrome extension to it.

## Prerequisites

1. SSH access to your Linux server
2. The server should have the face swap detection code at:
   `/mnt/harddisk/dataset/ML_vision_attack_swap_results/faceSwapDetector/faceswap-detection`
3. Conda environment `defense-dynamic-weight` should be available on the server

## Step 1: Configure Server Connection

1. Edit `connect_to_server.sh` and replace:

   - `YOUR_SERVER_IP` with your actual server IP address
   - `YOUR_USERNAME` with your SSH username

2. Edit `test_server.sh` and replace:

   - `YOUR_SERVER_IP` with your actual server IP address
   - `YOUR_USERNAME` with your SSH username

3. Edit `main.py` and replace:
   - `YOUR_LINUX_SERVER_IP` with your actual server IP address

## Step 2: Start the Face Swap Detection Server

1. Make the script executable:

   ```bash
   chmod +x connect_to_server.sh
   ```

2. Run the script to connect to the server and start the app:

   ```bash
   ./connect_to_server.sh
   ```

   This will:

   - Connect to your Linux server
   - Navigate to the face swap detection directory
   - Activate the conda environment
   - Start the app on port 5001

## Step 3: Test the Server

1. Make the test script executable:

   ```bash
   chmod +x test_server.sh
   ```

2. In a new terminal, test the server:

   ```bash
   ./test_server.sh
   ```

   This will send a test image to the server and show the response.

## Step 4: Start the Local FastAPI Server

1. Install the required Python packages:

   ```bash
   pip install -r requirements.txt
   ```

2. Start the local FastAPI server:

   ```bash
   python main.py
   ```

   This will start a server on `http://localhost:8000` that forwards requests to your Linux server.

## Step 5: Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select your extension directory
4. The extension will now capture images from Google Meet and send them to your server

## Troubleshooting

### If the server connection fails:

- Check that your server IP and username are correct
- Ensure SSH key authentication is set up
- Verify the server is accessible from your network

### If the face swap detection fails:

- Check that the conda environment `defense-dynamic-weight` exists
- Verify the path `/mnt/harddisk/dataset/ML_vision_attack_swap_results/faceSwapDetector/faceswap-detection` exists
- Ensure the `app.py` file is present in that directory

### If the Chrome extension doesn't work:

- Check the browser console for errors
- Verify the local FastAPI server is running on port 8000
- Ensure the server IP in `main.py` is correct

## Manual Commands

If you prefer to run commands manually:

### On the Linux server:

```bash
ssh YOUR_USERNAME@YOUR_SERVER_IP
cd /mnt/harddisk/dataset/ML_vision_attack_swap_results/faceSwapDetector/faceswap-detection
conda activate defense-dynamic-weight
python app.py
```

### Test the server:

```bash
curl -X POST \
  -H "x-api-key: test123" \
  -F "file=@/mnt/harddisk/dataset/ML_vision_attack_swap_results/image_set_1/NeoRefacer/000001_000002.jpg" \
  http://localhost:5001/predict
```

## File Structure

```
chrome extension face swap detection/
├── main.py                 # Local FastAPI server that forwards to Linux server
├── requirements.txt        # Python dependencies
├── connect_to_server.sh    # Script to connect to Linux server
├── test_server.sh         # Script to test the server
├── manifest.json          # Chrome extension manifest
├── content.js             # Chrome extension content script
├── popup.html             # Chrome extension popup
└── SETUP_GUIDE.md         # This guide
```
