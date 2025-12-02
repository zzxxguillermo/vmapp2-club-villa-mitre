import { apiClient } from '../../../services/api';
import { Beneficio, ApiPromotion } from '../types';

const API_BASE = 'https://surtekbb.com'.replace(/\/+$/, '');
const ENDPOINT = '/promotions';
const PER_PAGE = 15;

/* ===================== Helpers (parsers/mappers) ===================== */
const SURTEK_HTTP = /^http:\/\/([a-z0-9.-]*\.)?surtekbb\.com/i;
const toHttpsIfSurtek = (u: string) =>
    SURTEK_HTTP.test(u) ? u.replace(/^http:\/\//i, 'https://') : u;

// Normaliza claimUrl a RUTA RELATIVA si viene absoluta
const toRelativeIfAbsolute = (u?: string | null): string | null | undefined => {
    if (!u || typeof u !== 'string') return u;
    if (/^https?:\/\//i.test(u)) {
        try {
            const parsed = new URL(u);
            return parsed.pathname + (parsed.search || '');
        } catch {
            return u;
        }
    }
    return u;
};

function buildImageUrl(p: ApiPromotion): string {
    const link: string | undefined = p.image_link || p.imageLink;
    if (link && /^https?:\/\//i.test(link)) return toHttpsIfSurtek(link);

    const path: string | undefined = p.image_path || p.imagePath;
    if (path && typeof path === 'string') {
        const normalized = path.replace(/^\/+/, '');
        const urlPath = normalized.startsWith('promotions/') ? `storage/${normalized}` : normalized;
        return `${API_BASE}/${urlPath}`;
    }

    const fallback = p.image_url ?? p.image ?? p.imagenUrl ?? null;
    if (fallback && typeof fallback === 'string') {
        return /^https?:\/\//i.test(fallback)
            ? toHttpsIfSurtek(fallback)
            : `${API_BASE}/${fallback.replace(/^\/+/, '')}`;
    }
    return 'https://picsum.photos/seed/benefit/600/360';
}

function pickCommerceName(p: ApiPromotion): string {
    const comercioName = typeof p?.comercio === 'object' ? p?.comercio?.nombre : p?.comercio;
    return (
        p?.commerce?.name ||
        comercioName ||
        p?.establecimiento ||
        p?.business_name ||
        p?.merchantName ||
        'Comercio'
    );
}
function pickCategory(p: ApiPromotion): string | undefined {
    return p?.category?.name || p?.categoria || undefined;
}
function pickAddress(p: ApiPromotion): string | undefined {
    const comercioAddr = typeof p?.comercio === 'object' ? p?.comercio?.direccion : undefined;
    return p?.commerce?.address || comercioAddr || p?.direccion || p?.address || undefined;
}
function pickPhone(p: ApiPromotion): string | undefined {
    const comercioPhone = typeof p?.comercio === 'object' ? p?.comercio?.telefono : undefined;
    return p?.commerce?.phone || comercioPhone || p?.telefono || p?.phone || undefined;
}

function mapApiToBeneficio(p: ApiPromotion): Beneficio {
    const titulo = p.title ?? p.titulo ?? p.name ?? 'Beneficio';
    const descripcion = p.description ?? p.descripcion ?? '';
    const descuento =
        p.discount_text ?? p.descuento ?? p.benefit_text ?? (titulo ? String(titulo) : 'Beneficio');

    const originalId = p.id ?? p.promotion_id ?? p.promo_id;
    const id = String(originalId ?? p.uid ?? p.code ?? Math.random());

    const claimRaw: string | null = p.claim_qr_url ?? p.claimUrl ?? null;
    const claimUrl = toRelativeIfAbsolute(claimRaw) ?? null;

    return {
        id,
        originalId,
        claimUrl,
        comercio: pickCommerceName(p),
        categoria: pickCategory(p),
        descuento: String(descuento),
        direccion: pickAddress(p),
        telefono: pickPhone(p),
        imagenUrl: buildImageUrl(p),
        titulo: String(titulo),
        descripcion: String(descripcion),
        raw: p,
    };
}

export const beneficiosService = {
    getPromotions: async (page = 1) => {
        const response = await apiClient.get<any>(`${ENDPOINT}?page=${page}&per_page=${PER_PAGE}`);

        // Parse response
        let list: ApiPromotion[] = [];
        if (Array.isArray(response)) list = response;
        else if (Array.isArray(response?.data)) list = response.data;
        else if (Array.isArray(response?.items)) list = response.items;
        else if (Array.isArray(response?.results)) list = response.results;

        const mapped = list.map(mapApiToBeneficio);

        // Check hasMore
        let hasMore = false;
        if (response?.meta?.current_page != null && response?.meta?.last_page != null) {
            hasMore = Number(response.meta.current_page) < Number(response.meta.last_page);
        } else if (response?.links?.next) {
            hasMore = true;
        } else {
            hasMore = list.length >= PER_PAGE;
        }

        return {
            items: mapped,
            hasMore,
            nextPage: hasMore ? page + 1 : null,
        };
    },

    claimQrLegacy: async (promoId: string, userId: number) => {
        const response = await apiClient.post<any>(`/promotions/${promoId}/claim-qr`, { user_id: userId });
        return response;
    },

    claimQrByCode: async (code: string, userId: number) => {
        const response = await apiClient.post<any>(`/promotions/qrs/${code}/claim`, { user_id: userId });
        return response;
    },
};

export const extractCode = (s?: string | null): string | null => {
    if (!s) return null;
    try {
        const path = s.startsWith('http') ? new URL(s).pathname : s;
        const m = path.match(/\/promotions\/qrs\/([^\/?#]+)/i);
        return m ? m[1] : null;
    } catch {
        return null;
    }
};

export const addParams = (absUrl: string, params: Record<string, any>) => {
    try {
        const u = new URL(absUrl);
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && String(v).length > 0) {
                u.searchParams.set(k, String(v));
            }
        }
        return u.toString();
    } catch {
        return absUrl;
    }
};
