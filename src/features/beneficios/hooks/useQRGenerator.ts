import { useState, useEffect, useRef, useCallback } from 'react';
import { beneficiosService, extractCode, addParams } from '../services/beneficiosService';
import { Beneficio } from '../types';

interface UseQRGeneratorProps {
    beneficio?: Beneficio;
    userId?: number;
    dni?: string;
    externalUserId?: string;
}

export const useQRGenerator = ({ beneficio, userId, dni, externalUserId }: UseQRGeneratorProps) => {
    const [qrValue, setQrValue] = useState<string>('');
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const generateQR = useCallback(async () => {
        if (!beneficio?.id) {
            setIsLoading(false);
            setError('Faltan datos del beneficio.');
            return;
        }
        if (!userId || Number.isNaN(userId)) {
            setIsLoading(false);
            setError('No se encontró el usuario autenticado (user_id). Iniciá sesión nuevamente.');
            return;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsLoading(true);
        setError(null);

        try {
            // 1) Conseguir {code}:
            let code = extractCode(beneficio?.claimUrl ?? null);
            if (!code) {
                const legacyResp = await beneficiosService.claimQrLegacy(beneficio.id, userId);
                code = legacyResp?.code ?? extractCode(legacyResp?.qr_value ?? '');
            }
            if (!code) throw new Error('No se pudo obtener el código del QR.');

            // 2) Ruta nueva con QRS:
            const data = await beneficiosService.claimQrByCode(code, userId);

            if (!data || data.status === 'error') {
                throw new Error((data as any)?.message || 'Respuesta de error del servidor.');
            }

            // 3) URL para el QR
            const rawQr = data.qr_value || data.redeem_url;
            const API_BASE = 'https://surtekbb.com'; // Should come from env or service
            const API_VER = 'v1';

            if (rawQr) {
                setQrValue(addParams(rawQr, { dni, external_user_id: externalUserId, source: 'app' }));
            } else {
                const showAbs = `${API_BASE}/api/${API_VER}/promotions/qrs/${code}`;
                setQrValue(addParams(showAbs, { dni, external_user_id: externalUserId, source: 'app' }));
            }

            // 4) Timer
            const secs = Math.max(0, data.seconds_left ?? 0);
            setTimeRemaining(secs);
            setIsLoading(false);

            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            const msg = err?.message || 'No se pudo generar el QR';
            setError(msg);
            setIsLoading(false);
        }
    }, [beneficio, userId, dni, externalUserId]);

    useEffect(() => {
        generateQR();
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [generateQR]);

    return {
        qrValue,
        timeRemaining,
        isLoading,
        error,
        refresh: generateQR,
    };
};
