import { useState, useEffect } from 'react';
import { indoorApi } from '../../services/indoorApi';

export const useMediaCodes = () => {
  const [mediaCodes, setMediaCodes] = useState<Array<{value: string; label: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMediaCodes();
  }, []);

  const loadMediaCodes = async () => {
    try {
      const res = await indoorApi.autoclave.getAll();
      const rows: any[] = (res as any)?.data || (Array.isArray(res) ? res : []);
      const unique = Array.from(new Set(rows.map((m: any) => m.media_code).filter(Boolean)));
      setMediaCodes(unique.map(code => ({ value: code, label: code })));
    } catch {
      setMediaCodes([]);
    } finally {
      setLoading(false);
    }
  };

  return { mediaCodes, loading, reload: loadMediaCodes };
};
