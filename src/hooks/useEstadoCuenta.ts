import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchEstadoCuenta,
  cambiarUsuarioTesting,
  clearError,
} from '../store/slices/estadoCuentaSlice';
import { selectEstadoCuenta } from '../store';

export const useEstadoCuenta = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(selectEstadoCuenta);

  // Cargar estado de cuenta al montar el hook
  useEffect(() => {
    if (!data && !loading) {
      dispatch(fetchEstadoCuenta());
    }
  }, [dispatch, data, loading]);

  // Funciones de acción
  const refetch = () => {
    dispatch(fetchEstadoCuenta());
  };

  const cambiarUsuario = (alDia: boolean) => {
    dispatch(cambiarUsuarioTesting(alDia));
  };

  const limpiarError = () => {
    dispatch(clearError());
  };

  // Datos computados
  const estadoTexto = data?.alDia ? 'Al día' : 'Con deuda';
  const estadoColor = data?.alDia ? '#00973D' : '#E53E3E'; // Verde del club o rojo

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return {
    // Estado
    estadoCuenta: data,
    loading,
    error,

    // Acciones
    refetch,
    cambiarUsuario,
    limpiarError,

    // Datos computados
    estadoTexto,
    estadoColor,
    formatearMonto,
    formatearFecha,

    // Helpers booleanos
    alDia: data?.alDia ?? false,
    tieneDeuda: data ? !data.alDia : false,
    cuotasAdeudadas: data?.cuotasAdeudadas ?? 0,
    montoAdeudado: data?.montoAdeudado ?? 0,
  };
};
