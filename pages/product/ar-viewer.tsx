import { useEffect } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/router'

export default function ARViewer() {
  const router = useRouter()
  const { model } = router.query

  useEffect(() => {
    const modelViewer = document.querySelector('#model')
    const loadingOverlay = document.querySelector('.loading-overlay')
    
    const handleLoad = () => {
      if (loadingOverlay instanceof HTMLElement) {
        loadingOverlay.style.display = 'none'
      }
    }

    const handleProgress = (event: any) => {
      const progress = Math.floor(event.detail.totalProgress * 100)
      const loadingText = document.querySelector('.loading-text')
      if (loadingText) {
        loadingText.textContent = `Loading: ${progress}%`
      }
    }

    modelViewer?.addEventListener('load', handleLoad)
    modelViewer?.addEventListener('progress', handleProgress)

    return () => {
      modelViewer?.removeEventListener('load', handleLoad)
      modelViewer?.removeEventListener('progress', handleProgress)
    }
  }, [])

  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      />
      <div className="start-screen">
        <div className="ar-card">
          <div className="ar-header">
            <span className="ar-icon">🔮</span>
            <h1>Augmented Reality View</h1>
          </div>
          <p className="ar-subtitle">Experience this product in your space</p>
          <button id="startAR">
            <span className="button-icon">📱</span>
            Launch AR Experience
          </button>
          <div className="info-container">
            <div className="info-item">
              <span className="info-icon">✨</span>
              <p>View in your environment</p>
            </div>
            <div className="info-item">
              <span className="info-icon">⚡</span>
              <p>Loading speed varies with connection</p>
            </div>
            <div className="info-item">
              <span className="info-icon">💫</span>
              <p>Move around to explore in 3D</p>
            </div>
          </div>
        </div>
      </div>

      <div className="loading-overlay" style={{ display: 'none' }}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading: 0%</p>
          <p className="loading-hint">Preparing your AR experience...</p>
        </div>
      </div>

      <model-viewer
        id="model"
        src={model as string}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        shadow-intensity="1"
        ar-placement="floor"
        scale="0.5 0.5 0.5"
        style={{ display: 'none', width: '100%', height: '100vh' }}
      />

      <style jsx global>{`
        .start-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
        }

        .ar-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: 1.8rem;
          width: 90%;
          max-width: 400px;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ar-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .ar-icon {
          font-size: 2.5rem;
          margin-bottom: 0.8rem;
          display: block;
        }

        .ar-header h1 {
          color: #fff;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .ar-subtitle {
          color: #c7d2fe;
          text-align: center;
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }

        #startAR {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        #startAR:hover {
          background: #4f46e5;
          transform: translateY(-2px);
        }

        .button-icon {
          margin-right: 8px;
          font-size: 1.2rem;
        }

        .info-container {
          margin-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          margin: 1rem 0;
        }

        .info-icon {
          font-size: 1.2rem;
          margin-right: 12px;
          width: 24px;
        }

        .info-item p {
          color: #c7d2fe;
          margin: 0;
          font-size: 0.9rem;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(30, 27, 75, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #4338ca;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }

        .loading-text {
          color: #fff;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .loading-hint {
          color: #c7d2fe;
          font-size: 0.9rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('startAR')?.addEventListener('click', () => {
            const startScreen = document.querySelector('.start-screen')
            const loadingOverlay = document.querySelector('.loading-overlay')
            const modelViewer = document.querySelector('#model')
            
            if (startScreen) startScreen.style.display = 'none'
            if (loadingOverlay) loadingOverlay.style.display = 'flex'
            if (modelViewer) {
              modelViewer.style.display = 'block'
              modelViewer.activateAR()
            }
          });
        `
      }} />
    </>
  )
}
