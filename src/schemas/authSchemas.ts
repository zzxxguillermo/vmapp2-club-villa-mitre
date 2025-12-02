import { z } from 'zod';

export const loginSchema = z.object({
    dni: z
        .string()
        .min(1, 'El DNI es requerido')
        .regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z
    .object({
        dni: z
            .string()
            .min(1, 'El DNI es requerido')
            .regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos'),
        name: z
            .string()
            .min(1, 'El nombre es requerido')
            .min(2, 'El nombre debe tener al menos 2 caracteres'),
        email: z.string().min(1, 'El email es requerido').email('Email inválido'),
        password: z
            .string()
            .min(1, 'La contraseña es requerida')
            .min(8, 'Mínimo 8 caracteres')
            .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
            .regex(/[a-z]/, 'Debe contener al menos una minúscula')
            .regex(/[0-9]/, 'Debe contener al menos un número'),
        password_confirmation: z.string().min(1, 'Confirma tu contraseña'),
        phone: z
            .string()
            .optional()
            .refine((val) => !val || /^\+?[\d\s\-()]+$/.test(val), {
                message: 'Teléfono inválido',
            }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Las contraseñas no coinciden',
        path: ['password_confirmation'],
    });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
