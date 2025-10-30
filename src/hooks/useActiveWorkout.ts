/**
 * ⚠️ HOOK TEMPORALMENTE DESHABILITADO
 * Requiere actualización para API v2.0
 */

export const useActiveWorkout = () => {
  return {
    session: null,
    loading: false,
    error: null,
    startWorkout: () => {},
    completeExercise: () => {},
    finishWorkout: () => {},
  };
};

export default useActiveWorkout;
