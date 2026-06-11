import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaCamera, FaUndoAlt, FaCheckCircle, FaLightbulb, FaRegSmile } from 'react-icons/fa';

export default function WebcamCapture({ onCapture, multiFrame = true }) {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      if (multiFrame) {
        setIsCapturing(true);
        const images = [];
        // Capture 3 frames spaced out
        for (let i = 0; i < 3; i++) {
          images.push(webcamRef.current.getScreenshot());
          await new Promise(r => setTimeout(r, 200));
        }
        setIsCapturing(false);
        setImage(images[0]); // Preview first frame
        onCapture(images); // Send array of frames
      } else {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
        onCapture([imageSrc]);
      }
    }
  }, [webcamRef, onCapture, multiFrame]);

  const retake = () => {
    setImage(null);
    onCapture(null);
  };

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
    setImage(null);
    onCapture(null);
  };

  return (
    <div className="flex flex-col items-center w-full mt-4">
      {/* Container with exact aspect ratio enforcement */}
      <div className="relative w-full max-w-sm aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-300 flex items-center justify-center group">
        {!isCameraActive && !image ? (
          <div className="text-slate-400 flex flex-col items-center">
            <FaCamera className="text-3xl mb-2" />
            <p className="text-sm border p-2 rounded border-slate-600 bg-slate-900 mx-4 text-center mt-2">
              <strong>Tips for Best Match:</strong><br/>
              <FaRegSmile className="inline text-ecuOrange mr-1"/> Face camera directly<br/>
              <FaLightbulb className="inline text-ecuOrange mr-1"/> Ensure good lighting<br/>
              Avoid harsh shadows
            </p>
          </div>
        ) : image ? (
          <img src={image} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "user" }}
          />
        )}

        {isCapturing && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all">
             <div className="w-12 h-12 border-4 border-eciBlue border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-2 font-bold text-eciBlue drop-shadow-md">Scanning matrix...</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4 w-full max-w-sm">
        {!isCameraActive ? (
           <button 
             type="button"
             onClick={toggleCamera} 
             className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
           >
             <FaCamera /> Start Camera
           </button>
        ) : !image ? (
           <button 
             type="button"
             onClick={capture} 
             disabled={isCapturing}
             className="w-full bg-eciBlue hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium shadow-md transition flex items-center justify-center gap-2 disabled:bg-slate-400"
           >
             <FaCamera /> Capture Face Matrix
           </button>
        ) : (
           <>
             <button 
               type="button"
               onClick={retake} 
               className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
             >
               <FaUndoAlt /> Retake
             </button>
             <div className="flex-1 bg-green-100 text-green-700 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 border border-green-200 text-sm md:text-base">
               <FaCheckCircle /> Captured
             </div>
           </>
        )}
      </div>
    </div>
  );
}
