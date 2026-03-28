import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto 20px;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
  transform: scaleX(-1); // Mirror effect
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform: scaleX(-1); // Mirror effect to match video
`;

const StatusOverlay = styled(motion.div)`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(4px);
  z-index: 10;
`;

const EmotionLabel = styled(motion.div)`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(139, 92, 246, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
`;

const ToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 10px;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export default function EmotionDetector({ onEmotionChange }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState(null);
    const [showCamera, setShowCamera] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelLoaded(true);
                console.log('Face API models loaded');
            } catch (error) {
                console.error('Error loading models:', error);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        let interval;

        if (isDetecting && videoRef.current && canvasRef.current) {
            interval = setInterval(async () => {
                if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return;

                const displaySize = {
                    width: videoRef.current.videoWidth,
                    height: videoRef.current.videoHeight
                };

                if (displaySize.width === 0 || displaySize.height === 0) return;

                faceapi.matchDimensions(canvasRef.current, displaySize);

                const detections = await faceapi
                    .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);

                if (canvasRef.current) {
                    const context = canvasRef.current.getContext('2d');
                    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                }

                if (detections.length > 0) {
                    const expressions = detections[0].expressions;
                    const maxEmotion = Object.keys(expressions).reduce((a, b) =>
                        expressions[a] > expressions[b] ? a : b
                    );

                    if (maxEmotion !== currentEmotion) {
                        setCurrentEmotion(maxEmotion);
                        onEmotionChange(maxEmotion);
                    }
                }
            }, 500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isDetecting, currentEmotion, onEmotionChange]);

    const startVideo = () => {
        setShowCamera(true);
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => console.error('Error accessing webcam:', err));
    };

    const stopVideo = () => {
        setShowCamera(false);
        setIsDetecting(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleVideoPlay = () => {
        setIsDetecting(true);
    };

    return (
        <div style={{ width: '100%', marginBottom: '20px' }}>
            {!showCamera ? (
                <ToggleButton onClick={startVideo}>
                    📷 Enable Emotion Detection
                </ToggleButton>
            ) : (
                <Container>
                    <Video
                        ref={videoRef}
                        autoPlay
                        muted
                        onPlay={handleVideoPlay}
                    />
                    <Canvas ref={canvasRef} />

                    <AnimatePresence>
                        {!isModelLoaded && (
                            <StatusOverlay
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <span>⌛ Loading AI models...</span>
                            </StatusOverlay>
                        )}

                        {currentEmotion && (
                            <EmotionLabel
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={currentEmotion}
                            >
                                {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                            </EmotionLabel>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={stopVideo}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            zIndex: 20
                        }}
                    >
                        ✕
                    </button>
                </Container>
            )}
        </div>
    );
}
