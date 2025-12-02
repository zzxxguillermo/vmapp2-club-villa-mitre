import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingChatBot } from '../../../components/FloatingChatBot';
import { COLORS } from '../../../constants/colors';

/* ===================== IMPORTS DE IMÁGENES LOCALES ===================== */
import FutbolImg from '../../../../assets/actividades/futbol.jpg';
import BasquetImg from '../../../../assets/actividades/basket.jpeg';
import PatinImg from '../../../../assets/actividades/patin.jpg';
import VoleyImg from '../../../../assets/actividades/voley.jpg';
import GimnasiaArtisticaImg from '../../../../assets/actividades/gimnasia_artistica.jpg';
import HockeyImg from '../../../../assets/actividades/hockey_(1).jpg';
import HockeyPatinesImg from '../../../../assets/actividades/hockey_sobre_patines.png';
import FutsalImg from '../../../../assets/actividades/futsal.jpg';
import KarateImg from '../../../../assets/actividades/karate.jpg';
import BoxeoImg from '../../../../assets/actividades/boxeo.jpg';
// Nota: Existe futbol_femenino.jpg en assets, pero acá usamos una sola tarjeta "Fútbol" con ambos contactos.

type Contacto = { label: string; value: string };
type Actividad = {
  id: string;
  icono: string;
  titulo: string; // "Fútbol", "Básquet", etc.
  detalle: string; // "Masculino y Femenino +4", "Mixto +3", etc.
  lugar: string; // "Predio Deportivo La Ciudad", "Sede de Garibaldi", etc.
  contactos: Contacto[]; // Uno o varios contactos
  // Import/require estático devuelve number; las remotas serán string:
  imagenUrl: number | string;
};

const { width } = Dimensions.get('window');

/* ===================== DATA ORDENADA Y NORMALIZADA ===================== */
/* 1) Fútbol (Masculino/Femenino +4) - Predio Deportivo La Ciudad */
const futbol: Actividad = {
  id: 'futbol',
  icono: '⚽',
  titulo: 'Fútbol',
  detalle: 'Masculino y Femenino +4',
  lugar: 'Predio Deportivo La Ciudad',
  contactos: [
    { label: 'CONTACTO FÚTBOL MASCULINO', value: '2914737900' },
    { label: 'CONTACTO FÚTBOL FEMENINO', value: '2915741716' },
  ],
  imagenUrl: FutbolImg,
};

/* 2) Básquet (Masculino/Femenino +3) - Predio Deportivo La Ciudad */
const basquet: Actividad = {
  id: 'basquet',
  icono: '🏀',
  titulo: 'Básquet',
  detalle: 'Masculino y Femenino +3',
  lugar: 'Predio Deportivo La Ciudad',
  contactos: [
    { label: 'CONTACTO BÁSQUET MASCULINO', value: '2915748545' },
    { label: 'CONTACTO BÁSQUET FEMENINO', value: '2914133548' },
  ],
  imagenUrl: BasquetImg,
};

/* 3) Patín (Mixto +3) - Sede de Garibaldi */
const patin: Actividad = {
  id: 'patin',
  icono: '⛸️',
  titulo: 'Patín',
  detalle: 'Mixto +3',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: '2914370612' }],
  imagenUrl: PatinImg,
};

/* 4) Vóley (Mixto +6) - Sede de Garibaldi */
const voley: Actividad = {
  id: 'voley',
  icono: '🏐',
  titulo: 'Vóley',
  detalle: 'Mixto +6',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: 'IG: @villa_mitre_voley' }],
  imagenUrl: VoleyImg,
};

/* 5) Gimnasia Artística (Mixto +3) - Sede de Garibaldi */
const gimnasiaArtistica: Actividad = {
  id: 'gimnasia_artistica',
  icono: '🤸',
  titulo: 'Gimnasia Artística',
  detalle: 'Mixto +3',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: 'IG: @gimnasiaartisticacvmbb' }],
  imagenUrl: GimnasiaArtisticaImg,
};

/* 6) Hockey (Mixto +6) - Predio Deportivo La Ciudad */
const hockey: Actividad = {
  id: 'hockey',
  icono: '🏑',
  titulo: 'Hockey',
  detalle: 'Mixto +6',
  lugar: 'Predio Deportivo La Ciudad',
  contactos: [{ label: 'CONTACTO', value: '2915754040' }],
  imagenUrl: HockeyImg,
};

/* 7) Handball (Mixto +6) - Sede de Garibaldi (placeholder por ahora) */
const handball: Actividad = {
  id: 'handball',
  icono: '🤾',
  titulo: 'Handball',
  detalle: 'Mixto +6',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: '2915669907' }],
  imagenUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&h=600&fit=crop',
};

/* 8) Hockey sobre Patines (Mixto +5) - Sede de Garibaldi */
const hockeyPatines: Actividad = {
  id: 'hockey_patines',
  icono: '🏒',
  titulo: 'Hockey sobre Patines',
  detalle: 'Mixto +5',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: '2915064363' }],
  imagenUrl: HockeyPatinesImg,
};

/* 9) Futsal (Masculino +16) - Sede de Garibaldi */
const futsal: Actividad = {
  id: 'futsal',
  icono: '⚽',
  titulo: 'Futsal',
  detalle: 'Masculino +16',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: '2914622376' }],
  imagenUrl: FutsalImg,
};

/* 10) Karate (Mixto +7) - Sede de Garibaldi */
const karate: Actividad = {
  id: 'karate',
  icono: '🥋',
  titulo: 'Karate',
  detalle: 'Mixto +7',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: '2915272778' }],
  imagenUrl: KarateImg,
};

/* 11) Boxeo (Mixto +7) - Espacio Villa Obrera */
const boxeo: Actividad = {
  id: 'boxeo',
  icono: '🥊',
  titulo: 'Boxeo',
  detalle: 'Mixto +7',
  lugar: 'Espacio Villa Obrera',
  contactos: [{ label: 'CONTACTO', value: '2914480251' }],
  imagenUrl: BoxeoImg,
};

/* 12) NewCom (Mixto +40) - Sede de Garibaldi (usa foto de vóley por ahora) */
const newcom: Actividad = {
  id: 'newcom',
  icono: '🏐',
  titulo: 'NewCom',
  detalle: 'Mixto +40',
  lugar: 'Sede de Garibaldi',
  contactos: [{ label: 'CONTACTO', value: '2915704254' }],
  imagenUrl: VoleyImg,
};

/* 13) Zumba (Mixto +14) - Espacio Villa Obrera (placeholder) */
const zumba: Actividad = {
  id: 'zumba',
  icono: '💃',
  titulo: 'Zumba',
  detalle: 'Mixto +14',
  lugar: 'Espacio Villa Obrera',
  contactos: [{ label: 'CONTACTO', value: '2914220575' }],
  imagenUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=600&fit=crop',
};

const actividadesDeportivas: Actividad[] = [
  futbol,
  basquet,
  patin,
  voley,
  gimnasiaArtistica,
  hockey,
  handball,
  hockeyPatines,
  futsal,
  karate,
  boxeo,
  newcom,
  zumba,
];

/* ===================== Helpers UI ===================== */
const isPhone = (v: string) => /^[\d+\s-]{6,}$/.test(v.trim());
const isInstagram = (v: string) => /^IG:\s*@?([\w._]+)/i.test(v.trim());
const extractIgHandle = (v: string) => {
  const m = v.trim().match(/^IG:\s*@?([\w._]+)/i);
  return m ? m[1] : null;
};

export default function ActividadesScreen() {
  const screenWidth = width;
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  const handleImageLoadStart = (id: string) => setImageLoading((prev) => ({ ...prev, [id]: true }));
  const handleImageLoadEnd = (id: string) => setImageLoading((prev) => ({ ...prev, [id]: false }));

  const headerCount = useMemo(() => actividadesDeportivas.length, []);

  const onPressContacto = (value: string) => {
    if (isPhone(value)) {
      const tel = value.replace(/[^\d+]/g, '');
      Linking.openURL(`tel:${tel}`).catch(() => { });
    } else if (isInstagram(value)) {
      const handle = extractIgHandle(value);
      if (handle) {
        Linking.openURL(`https://instagram.com/${handle}`).catch(() => { });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Actividades Deportivas</Text>
      <Text style={styles.subHeaderText}>
        Descubrí las actividades deportivas del club. ({headerCount})
      </Text>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {actividadesDeportivas.map((actividad) => (
          <View key={actividad.id} style={[styles.card, { width: screenWidth * 0.9 }]}>
            <Image
              source={
                typeof actividad.imagenUrl === 'string'
                  ? { uri: actividad.imagenUrl }
                  : actividad.imagenUrl
              }
              style={styles.image}
              onLoadStart={() => handleImageLoadStart(actividad.id)}
              onLoadEnd={() => handleImageLoadEnd(actividad.id)}
              resizeMode="cover"
            />
            {imageLoading[actividad.id] && (
              <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} style={styles.loader} />
            )}

            <View style={styles.info}>
              <Text style={styles.title}>
                {actividad.icono} {actividad.titulo}
              </Text>
              <Text style={styles.detail}>{actividad.detalle}</Text>

              {/* Lugar de entrenamiento */}
              <View style={styles.row}>
                <Ionicons name="location-outline" size={16} color={COLORS.GRAY_MEDIUM} />
                <Text style={styles.place}>Lugar de entrenamiento: {actividad.lugar}</Text>
              </View>

              {/* Contactos */}
              <View style={{ marginTop: 8, gap: 6 }}>
                {actividad.contactos.map((c, idx) => (
                  <TouchableOpacity
                    key={`${actividad.id}-c-${idx}`}
                    activeOpacity={0.7}
                    onPress={() => onPressContacto(c.value)}
                    style={styles.row}
                  >
                    <Ionicons name="call-outline" size={16} color={COLORS.GRAY_MEDIUM} />
                    <Text style={styles.contact}>
                      {c.label}: <Text style={styles.contactValue}>{c.value}</Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <FloatingChatBot />
    </View>
  );
}

/* ===================== Styles ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    textAlign: 'center',
    marginVertical: 20,
  },
  subHeaderText: {
    fontSize: 16,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    marginVertical: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: '100%', height: 180 },
  loader: { position: 'absolute', top: '40%', left: '45%' },
  info: { padding: 15 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.PRIMARY_BLACK,
  },
  detail: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  place: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
    flexShrink: 1,
  },
  contact: {
    fontSize: 14,
    color: COLORS.PRIMARY_BLACK,
    flexShrink: 1,
  },
  contactValue: { color: COLORS.GRAY_MEDIUM },
});
