import { useEffect } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/router'

export default function ARViewer() {
  const router = useRouter()
  const { model } = router.query

  useEffect(() => {
    const modelViewer = document.querySelector('#model')
    
    modelViewer?.addEventListener('load', () => {
      console.log('Model loaded successfully')
      document.querySelector('.loading-overlay')?.remove()
    })

    modelViewer?.addEventListener('progress', (event: any) => {
      const progress = Math.floor(event.detail.totalProgress * 100)
      const loadingText = document.querySelector('.loading-text')
      if (loadingText) {
        loadingText.textContent = `Loading: ${progress}%`
      }
    })

    modelViewer?.addEventListener('error', (error) => {
      fetch(model as string)
        .then(response => {
          console.log('Content-Type:', response.headers.get('content-type'))
          console.log('Response status:', response.status)
          return response.blob()
        })
        .then(blob => {
          console.log('Blob type:', blob.type)
        })
    })
  }, [])

  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      />
      <div className="start-screen">
        <button id="startAR">Launch AR View</button>
      </div>

      <div className="loading-overlay" style={{ display: 'none' }}>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading: 0%</p>
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
          background: #f5f5f5;
        }
        #startAR {
          padding: 20px 40px;
          font-size: 18px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('startAR').addEventListener('click', () => {
            document.querySelector('.start-screen').style.display = 'none';
            document.querySelector('.loading-overlay').style.display = 'flex';
            document.getElementById('model').style.display = 'block';
            document.getElementById('model').activateAR();
          });
        `
      }} />
    </>
  )
}
