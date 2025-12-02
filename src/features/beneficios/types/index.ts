export interface Beneficio {
    id: string;
    originalId?: string | number;
    claimUrl?: string | null;
    comercio: string;
    descuento: string;
    categoria?: string;
    direccion?: string;
    telefono?: string;
    imagenUrl: string;
    titulo?: string;
    descripcion?: string;
    raw?: any;
}

export interface ApiPromotion {
    id?: number | string;
    promotion_id?: number | string;
    promo_id?: number | string;
    uid?: string;
    code?: string;
    title?: string;
    titulo?: string;
    name?: string;
    description?: string;
    descripcion?: string;
    discount_text?: string;
    descuento?: string;
    benefit_text?: string;
    claim_qr_url?: string;
    claimUrl?: string;
    image_link?: string;
    imageLink?: string;
    image_path?: string;
    imagePath?: string;
    image_url?: string;
    image?: string;
    imagenUrl?: string;
    commerce?: {
        name?: string;
        address?: string;
        phone?: string;
    };
    comercio?: {
        nombre?: string;
        direccion?: string;
        telefono?: string;
    } | string;
    establecimiento?: string;
    business_name?: string;
    merchantName?: string;
    category?: {
        name?: string;
    };
    categoria?: string;
    direccion?: string;
    address?: string;
    telefono?: string;
    phone?: string;
}
