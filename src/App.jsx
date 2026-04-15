import { useState, useRef } from "react";
import axios from "axios";
import { UploadCloud, Image as ImageIcon, Download, RefreshCw, Wand2 } from 'lucide-react';

function App() {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [resultUrl, setResultUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (PNG, JPG, etc.)');
                return;
            }
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null);
            setError(null);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveBackground = async () => {
        if (!image) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("image", image);

        try {
            // Using the proxy setup in vite.config.js to call local server
            const res = await axios.post("/api/remove-bg", formData, { 
                responseType: "blob",
                timeout: 30000 // 30 second timeout as remove.bg can sometimes take a moment
            });

            if (res.data.size === 0) {
                 throw new Error("Received empty response from server");
            }
            
            setResultUrl(URL.createObjectURL(res.data));
        } catch (err) {
            console.error("Error removing background:", err);
            if (err.response?.status === 402) {
               setError("Remove.bg API credits exceeded or invalid key.");
            } else {
               setError(err.response?.data?.message || err.message || "Failed to remove background. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>PhotoMagic</h1>
                <p>AI-Powered Background Removal</p>
            </header>

            <main className="main-card">
                {error && <div className="error-message">{error}</div>}

                {!previewUrl && (
                    <div 
                        className="upload-area" 
                        onClick={handleUploadClick}
                    >
                        <UploadCloud className="upload-icon" />
                        <h2 className="upload-text">Upload an Image</h2>
                        <p className="upload-subtext">Drop your image here or click to browse</p>
                        <input 
                            type="file" 
                            className="file-input" 
                            onChange={handleFileChange} 
                            ref={fileInputRef}
                            accept="image/*"
                        />
                    </div>
                )}

                {previewUrl && !resultUrl && !isLoading && (
                    <div className="preview-container">
                        <div className="image-comparison">
                            <div className="image-box">
                                <h3>Original Image</h3>
                                <div className="img-wrapper">
                                    <img src={previewUrl} alt="Original" className="preview-img" />
                                </div>
                            </div>
                        </div>

                        <div className="actions">
                            <button className="btn btn-secondary" onClick={handleReset}>
                                <RefreshCw size={18} /> Choose Another
                            </button>
                            <button className="btn btn-primary" onClick={handleRemoveBackground}>
                                <Wand2 size={18} /> Remove Background
                            </button>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="loader-container">
                        <span className="loader"></span>
                        <p className="loader-text">Applying AI Magic...</p>
                    </div>
                )}

                {resultUrl && !isLoading && (
                    <div className="preview-container">
                        <div className="image-comparison">
                            <div className="image-box">
                                <h3>Original</h3>
                                <div className="img-wrapper">
                                    <img src={previewUrl} alt="Original" className="preview-img" />
                                </div>
                            </div>
                            <div className="image-box">
                                <h3>Result</h3>
                                <div className="img-wrapper checkerboard-bg">
                                    <img src={resultUrl} alt="Result without background" className="preview-img" />
                                </div>
                            </div>
                        </div>

                        <div className="actions">
                            <button className="btn btn-secondary" onClick={handleReset}>
                                <RefreshCw size={18} /> Start Over
                            </button>
                            <a 
                                href={resultUrl} 
                                download="magic-removed-bg.png"
                                className="btn btn-primary"
                                style={{textDecoration: 'none'}}
                            >
                                <Download size={18} /> Download HD
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
