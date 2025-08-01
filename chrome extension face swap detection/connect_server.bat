@echo off
echo Connecting to Linux server...

REM Connect to the server using SSH
ssh -p 2222 xiaodongan@99.92.208.110

echo If connection successful, run these commands on the server:
echo cd /mnt/harddisk/dataset/ML_vision_attack_swap_results/faceSwapDetector/faceswap-detection
echo conda activate defense-dynamic-weight
echo python app.py

pause 