import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { WORKER_PATH, CORE_PATH, LANG_PATH } from './tesseractPaths';

// Mensajes de estado que emite Tesseract.js durante el reconocimiento,
// traducidos para mostrar al usuario.
const STATUS_LABELS = {
  'loading tesseract core': 'Cargando motor OCR…',
  'initializing tesseract': 'Inicializando OCR…',
  'loading language traineddata': 'Cargando datos de idioma…',
  'initializing api': 'Preparando reconocimiento…',
  'recognizing text': 'Extrayendo texto…',
};

export function useOcrWorker() {
  const workerRef = useRef(null);
  const workerPromiseRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const getWorker = useCallback(() => {
    if (workerRef.current) return Promise.resolve(workerRef.current);
    if (!workerPromiseRef.current) {
      workerPromiseRef.current = createWorker(['spa', 'eng'], 1, {
        workerPath: WORKER_PATH,
        corePath: CORE_PATH,
        langPath: LANG_PATH,
        logger: (m) => {
          if (typeof m.progress === 'number') setProgress(m.progress);
          if (m.status) setStatusLabel(STATUS_LABELS[m.status] || m.status);
        },
      }).then((worker) => {
        workerRef.current = worker;
        return worker;
      });
    }
    return workerPromiseRef.current;
  }, []);

  useEffect(() => () => {
    workerRef.current?.terminate();
  }, []);

  const recognize = useCallback(async (image) => {
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStatusLabel('Preparando…');
    try {
      const worker = await getWorker();
      const { data } = await worker.recognize(image);
      return data.text.trim();
    } catch (err) {
      const message = err?.message || 'No se pudo procesar la imagen.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [getWorker]);

  return { recognize, progress, statusLabel, isProcessing, error };
}
