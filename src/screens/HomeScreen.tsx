// HomeScreen.tsx
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import type { DrawerContentComponentProps, DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/Logo';
import { CommonActions } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useAuth } from '../features/auth/hooks/useAuth';
import DetalleCuponScreen from './DetalleCuponScreen';

import HomeMainScreen from './HomeMainScreen';
import ActividadesScreen from '../features/activities/screens/ActividadesScreen';
import CentroDeportivoScreen from './CentroDeportivoScreen';
import AreasInstitucionalesScreen from './AreasInstitucionalesScreen';
import ServiciosScreen from './ServiciosScreen';
import MisPuntosScreen from './MisPuntosScreen';
import MisBeneficiosScreen from './MisBeneficiosScreen';
import EstadoDeCuentaScreen from './EstadoDeCuentaScreen';
import MiCarnetScreen from './MiCarnetScreen';
import QRBeneficioScreen from './QRBeneficioScreen';
import GimnasioScreen from '../features/gym/screens/GimnasioScreen';
import TemplateDetailScreen from '../features/gym/screens/TemplateDetailScreen';
import WeeklyScheduleScreen from '../features/gym/screens/WeeklyScheduleScreen';
// ❌ import eliminado:
// import MisCuponesScreen from './MisCuponesScreen';

// -------- Param list para tipar rutas --------
type DrawerParamList = {
  HomeMain: undefined;
  Actividades: undefined;
  CentroDeportivo: undefined;
  Gimnasio: undefined;
  TemplateDetails: { id?: string } | undefined;
  WeeklySchedule: undefined;
  // ❌ MisCupones eliminado
  AreasInstitucionales: undefined;
  Servicios: undefined;
  MisPuntos: undefined;
  QRBeneficio: { code?: string } | undefined;
  MisBeneficios: undefined; // ✅ mantenemos MisBeneficios
  EstadoDeCuenta: undefined;
  MiCarnet: undefined;
  DetalleCupon: { beneficio?: any; cupon?: any; item?: any; promotion?: any; promo?: any } | undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

// -------- Drawer personalizado --------
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { logout, user } = useAuth();
  const nav = props.navigation as any;

  const hasAccess = (feature: string): boolean => {
    const userType = user?.user_type;
    switch (feature) {
      case 'home':
      case 'actividades_deportivas':
      case 'centro_deportivo':
      case 'areas_institucionales':
      case 'servicios':
      case 'beneficios': // ✅ acceso público a beneficios
        return true;
      case 'mis_puntos':
      case 'carnet':
      case 'estado_cuenta':
        return userType === 'api';
      default:
        return false;
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            props.navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              })
            );
          } catch {
            Alert.alert('Error', 'No se pudo cerrar la sesión correctamente');
          }
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Home */}
      {hasAccess('home') && (
        <DrawerItem
          label="Home"
          icon={() => <Ionicons name="home-outline" size={22} />}
          onPress={() => nav.navigate('HomeMain')}
        />
      )}

      {/* Actividades Deportivas */}
      {hasAccess('actividades_deportivas') && (
        <DrawerItem
          label="Actividades Deportivas"
          icon={() => <Ionicons name="basketball-outline" size={22} />}
          onPress={() => nav.navigate('Actividades')}
        />
      )}

      {/* Centro Deportivo */}
      {hasAccess('centro_deportivo') && (
        <DrawerItem
          label="Centro Deportivo"
          icon={() => <Ionicons name="fitness-outline" size={22} />}
          onPress={() => nav.navigate('CentroDeportivo')}
        />
      )}

      {/* Áreas Institucionales */}
      {hasAccess('areas_institucionales') && (
        <DrawerItem
          label="Áreas Institucionales"
          icon={() => <Ionicons name="business-outline" size={22} />}
          onPress={() => nav.navigate('AreasInstitucionales')}
        />
      )}

      {/* Servicios */}
      {hasAccess('servicios') && (
        <DrawerItem
          label="Servicios"
          icon={() => <Ionicons name="grid-outline" size={22} />}
          onPress={() => nav.navigate('Servicios')}
        />
      )}

      {/* ✅ Mis Beneficios (reemplaza Mis Cupones) */}
      {hasAccess('beneficios') && (
        <DrawerItem
          label="Mis Beneficios"
          icon={() => <Ionicons name="gift-outline" size={22} />}
          onPress={() => nav.navigate('MisBeneficios')}
        />
      )}

      {/* Mis Puntos */}
      {hasAccess('mis_puntos') && (
        <DrawerItem
          label="Mis Puntos"
          icon={() => <Ionicons name="star-outline" size={22} />}
          onPress={() => nav.navigate('MisPuntos')}
        />
      )}

      {/* Cerrar Sesión */}
      <DrawerItem
        label="Cerrar Sesión"
        icon={() => <Ionicons name="log-out-outline" size={22} color={COLORS.ERROR} />}
        labelStyle={{ color: COLORS.ERROR }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}

// -------- Drawer principal --------
export default function HomeScreen() {
  return (
    <Drawer.Navigator
      initialRouteName="HomeMain"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.PRIMARY_GREEN, height: 110 },
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontFamily: 'BarlowCondensed-Bold',
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: 1.2,
          marginLeft: 0,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: COLORS.WHITE,
        },
        headerTitle: 'CLUB VILLA MITRE',
        headerRight: () => (
          <TouchableOpacity
            style={{ paddingRight: 20, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => navigation.navigate('HomeMain')}
            activeOpacity={0.7}
          >
            <Logo backgroundColor="light" size="medium" style={{ width: 45, height: 45 }} />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="HomeMain"
        component={HomeMainScreen}
        options={{ headerTitle: 'CLUB VILLA MITRE' }}
      />

      <Drawer.Screen name="Actividades" component={ActividadesScreen} />
      <Drawer.Screen name="CentroDeportivo" component={CentroDeportivoScreen} />

      {/* ✅ Gimnasio */}
      <Drawer.Screen
        name="Gimnasio"
        component={GimnasioScreen}
        options={{ headerTitle: 'GIMNASIO' }}
      />

      {/* ✅ Detalle de Rutina */}
      <Drawer.Screen
        name="TemplateDetails"
        component={TemplateDetailScreen}
        options={{ headerTitle: 'Detalle de Rutina' }}
      />

      <Drawer.Screen
        name="DetalleCupon"
        component={DetalleCuponScreen}
        options={({ route }) => {
          const p: any = route?.params ?? {};
          const obj = p?.beneficio ?? p?.cupon ?? p?.item ?? p?.promotion ?? p?.promo ?? {};
          const title = obj?.titulo ?? obj?.title ?? 'Detalle';
          return { title };
        }}
      />

      {/* ✅ Calendario Semanal */}
      <Drawer.Screen
        name="WeeklySchedule"
        component={WeeklyScheduleScreen}
        options={{ headerTitle: 'Calendario Semanal' }}
      />

      {/* ❌ MisCupones eliminado
      <Drawer.Screen name="MisCupones" component={MisCuponesScreen} />
      */}

      <Drawer.Screen name="AreasInstitucionales" component={AreasInstitucionalesScreen} />
      <Drawer.Screen name="Servicios" component={ServiciosScreen} />
      <Drawer.Screen name="MisPuntos" component={MisPuntosScreen} />
      <Drawer.Screen name="QRBeneficio" component={QRBeneficioScreen} />
      <Drawer.Screen name="MisBeneficios" component={MisBeneficiosScreen} />
      <Drawer.Screen name="EstadoDeCuenta" component={EstadoDeCuentaScreen} />
      <Drawer.Screen name="MiCarnet" component={MiCarnetScreen} />
    </Drawer.Navigator>
  );
}
