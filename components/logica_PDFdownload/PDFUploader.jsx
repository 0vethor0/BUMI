// components/PDFUploader.jsx
'use client';

import { useState } from 'react';

export default function PDFUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [successUrl, setSuccessUrl] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
      setSuccessUrl('');
    } else {
      setError('Por favor selecciona solo archivos PDF');
      setFile(null);
    }
  };

  const uploadToR2 = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // 1. Pedir presigned URL
      const res = await fetch('/api/r2-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!res.ok) throw new Error('No se pudo obtener URL de subida');

      const { signedUrl, publicUrl } = await res.json();

      // 2. Subir directamente a R2 con progreso real
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setSuccessUrl(publicUrl);
          onUploadSuccess(publicUrl); // Aquí le pasas la URL a tu formulario
        } else {
          setError('Error al subir el archivo a Cloudflare');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Error de red al subir el archivo');
        setUploading(false);
      });

      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (err) {
      setError(err.message || 'Error inesperado');
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Subir Documento PDF</h3>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-900 border rounded-lg cursor-pointer bg-gray-50"
      />

      {file && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Archivo seleccionado: {file.name}</p>
          <button
            onClick={uploadToR2}
            disabled={uploading}
            className={`mt-3 px-6 py-2 rounded text-white font-medium ${
              uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Subiendo...' : 'Subir a Cloudflare R2'}
          </button>
        </div>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-700 mt-1">{progress}% completado</p>
        </div>
      )}

      {successUrl && (
        <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded">
          <p className="text-green-800 font-medium">¡Subido con éxito!</p>
          <a href={successUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
            Ver PDF en Cloudflare R2
          </a>
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}