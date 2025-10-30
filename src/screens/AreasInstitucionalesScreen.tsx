import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type Contacto = {
  label?: string;
  whatsapp?: string; // número sin espacios recomendado (pero soporta con guiones/espacios)
  phone?: string;
  address?: string;
  hours?: string;
  web?: string;
};

type Item = { text: string };

type SubSeccion = {
  titulo: string;
  descripcion?: string;
  items?: Item[];
  contactos?: Contacto[];
};

type AreaInstitucional = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
  hasDoubleLogo?: boolean;
  secciones?: SubSeccion[];
};

const areasInstitucionales: AreaInstitucional[] = [
  {
    id: '1',
    title: 'Educación y Cultura',
    description: 'Jardín “La Ciudad” y propuestas artísticas y formativas',
    icon: 'library-outline',
    screen: 'CulturaEducacion',
    hasDoubleLogo: true,
    secciones: [
      {
        titulo: 'Jardín de Infantes y Maternal “La Ciudad”',
        descripcion: 'Propuesta educativa para niños y niñas de 18 meses a 5 años.',
        items: [
          { text: 'Talleres deportivos' },
          { text: 'Jornada extendida' },
          { text: 'Natación' },
          { text: 'Inglés' },
          { text: 'Música' },
          { text: 'Articulación con nivel primario' },
        ],
        contactos: [
          {
            label: 'WhatsApp',
            whatsapp: '2915081186',
          },
          {
            label: 'Dirección',
            address: 'Maipú 2361',
          },
          {
            label: 'Horario de atención',
            hours: 'Lunes a viernes, de 8:00 a 17:00 hs.',
          },
        ],
      },
      {
        titulo: 'Área Cultural',
        descripcion:
          'Propuestas artísticas, formativas y recreativas que fortalecen la identidad y la vida comunitaria.',
        items: [
          { text: 'Canto' },
          { text: 'Tango' },
          { text: 'Danzas Árabes' },
          { text: 'Ritmos y Danzas' },
          { text: 'Teatro Antiestrés' },
          { text: 'Lengua de Señas' },
        ],
        contactos: [
          {
            label: 'Subcomisión de Cultura',
            phone: '2915348520',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Área Social',
    description: 'Programas de inclusión, acompañamiento y contención',
    icon: 'people-outline',
    screen: 'AreaSocial',
    secciones: [
      {
        titulo: 'Área Social',
        descripcion:
          'Promueve programas y acciones de inclusión, acompañamiento y contención para personas y familias.',
        items: [
          { text: 'Programa de becas deportivas' },
          { text: 'Articulación con instituciones intermedias' },
          { text: 'Acciones solidarias' },
        ],
        contactos: [{ label: 'WhatsApp', whatsapp: '2914416377' }],
      },
    ],
  },
  {
    id: '3',
    title: 'Género y Diversidad',
    description: 'Igualdad de derechos y erradicación de violencias',
    icon: 'heart-outline',
    screen: 'AreaGenero',
    secciones: [
      {
        titulo: 'Área de Género y Diversidad',
        descripcion:
          'Fomenta la igualdad de derechos, la sensibilización y la erradicación de todo tipo de violencia o discriminación por motivos de género.',
        items: [
          { text: 'Capacitaciones internas' },
          { text: 'Jornadas de concientización' },
          { text: 'Articulación con otras instituciones' },
        ],
        contactos: [{ label: 'WhatsApp', whatsapp: '2914416377' }],
      },
    ],
  },
  {
    id: '4',
    title: 'Servicios',
    description: 'Tienda Oficial, Mutual 14 de Agosto y Villa Mitre Viajes',
    icon: 'bag-handle-outline',
    secciones: [
      {
        titulo: 'Tienda de Productos Oficiales',
        descripcion:
          'Indumentaria y artículos institucionales para promover el sentido de pertenencia.',
        contactos: [
          {
            label: 'Horario',
            hours:
              'Lunes a viernes de 9:00 a 13:00 y de 16:00 a 20:30 hs. Sábados de 9:00 a 13:00 y de 17:00 a 20:30 hs.',
          },
          { label: 'Dirección', address: 'Garibaldi 119' },
          { label: 'WhatsApp', whatsapp: '2915767712' },
        ],
      },
      {
        titulo: 'Mutual 14 de Agosto',
        descripcion:
          'Entidad mutual del Club Villa Mitre con múltiples prestaciones y beneficios. Si sos socio del Club, sos socio de la Mutual.',
        items: [
          { text: 'Profesionales de la salud' },
          { text: 'Farmacias' },
          { text: 'Laboratorios' },
          { text: 'Diagnóstico por imágenes' },
          { text: 'Ópticas' },
          { text: 'Cosmetología' },
        ],
        contactos: [
          { label: 'WhatsApp', whatsapp: '2914481924' },
          { label: 'Dirección', address: 'Garibaldi 149' },
          { label: 'Horario', hours: 'Lunes a viernes, de 8:30 a 12:30 hs.' },
        ],
      },
      {
        titulo: 'Villa Mitre Viajes',
        descripcion:
          'Agencia de viajes y turismo del Club: salidas regionales, nacionales e internacionales, viajes de quinceañeras y más.',
        contactos: [
          { label: 'WhatsApp', whatsapp: '2914642424' },
          { label: 'Dirección', address: 'Garibaldi 149' },
          { label: 'Horario', hours: 'Lunes a viernes, de 8:00 a 12:00 y de 16:00 a 20:00 hs.' },
          { label: 'Web', web: 'https://mutual1408clubvillamitre.tur.ar' },
        ],
      },
    ],
  },
];

export default function AreasInstitucionalesScreen() {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleAreaPress = (area: AreaInstitucional) => {
    if (area.screen) {
      // @ts-ignore - Navegación a pantallas específicas si existen en tu navigator
      navigation.navigate(area.screen);
    } else {
      setExpanded(prev => ({ ...prev, [area.id]: !prev[area.id] }));
    }
  };

  const openWhatsApp = (raw?: string) => {
    if (!raw) return;
    const num = raw.replace(/[^\d]/g, ''); // limpia espacios, guiones, etc.
    // Abre chat directo. Si querés mensaje predefinido, agregá &text=...
    Linking.openURL(`https://wa.me/${num}`).catch(() => {});
  };

  const openPhone = (raw?: string) => {
    if (!raw) return;
    const num = raw.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${num}`).catch(() => {});
  };

  const openMaps = (address?: string) => {
    if (!address) return;
    const q = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
  };

  const openWeb = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Áreas Institucionales</Text>
      <Text style={styles.subHeaderText}>
        Conocé las diferentes áreas que trabajan por la comunidad del club
      </Text>

      <View style={styles.areasContainer}>
        {areasInstitucionales.map(area => {
          const isOpen = !!expanded[area.id];
          return (
            <View key={area.id} style={styles.cardWrapper}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.areaCard}
                onPress={() => handleAreaPress(area)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={area.icon} size={28} color={COLORS.PRIMARY_GREEN} />
                  {area.hasDoubleLogo && (
                    <View style={styles.doubleLogo}>
                      <Text style={styles.doubleLogoText}>••</Text>
                    </View>
                  )}
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.areaTitle}>{area.title}</Text>
                  <Text style={styles.areaDescription}>{area.description}</Text>
                </View>

                <Ionicons
                  name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={22}
                  color={COLORS.GRAY_MEDIUM}
                />
              </TouchableOpacity>

              {/* Detalle expandible */}
              {isOpen && area.secciones?.length ? (
                <View style={styles.detailBox}>
                  {area.secciones.map((sec, idx) => (
                    <View key={`${area.id}-sec-${idx}`} style={styles.sectionBlock}>
                      <Text style={styles.sectionTitle}>{sec.titulo}</Text>
                      {sec.descripcion ? (
                        <Text style={styles.sectionDesc}>{sec.descripcion}</Text>
                      ) : null}

                      {sec.items?.length ? (
                        <View style={styles.itemsList}>
                          {sec.items.map((it, i) => (
                            <View key={`item-${i}`} style={styles.itemRow}>
                              <Text style={styles.bullet}>•</Text>
                              <Text style={styles.itemText}>{it.text}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      {sec.contactos?.length ? (
                        <View style={styles.contactsBox}>
                          {sec.contactos.map((c, i) => (
                            <View key={`ct-${i}`} style={styles.contactRow}>
                              {/* WhatsApp */}
                              {c.whatsapp ? (
                                <TouchableOpacity
                                  style={styles.contactPill}
                                  onPress={() => openWhatsApp(c.whatsapp)}
                                  activeOpacity={0.8}
                                >
                                  <Ionicons name="logo-whatsapp" size={16} color={COLORS.WHITE} />
                                  <Text style={styles.contactPillText}>
                                    {c.label ? `${c.label}: ` : ''}{c.whatsapp}
                                  </Text>
                                </TouchableOpacity>
                              ) : null}

                              {/* Teléfono */}
                              {c.phone ? (
                                <TouchableOpacity
                                  style={[styles.contactPill, { backgroundColor: '#64748b' }]}
                                  onPress={() => openPhone(c.phone)}
                                  activeOpacity={0.8}
                                >
                                  <Ionicons name="call-outline" size={16} color={COLORS.WHITE} />
                                  <Text style={styles.contactPillText}>
                                    {c.label ? `${c.label}: ` : ''}{c.phone}
                                  </Text>
                                </TouchableOpacity>
                              ) : null}

                              {/* Dirección */}
                              {c.address ? (
                                <TouchableOpacity
                                  style={[styles.contactPill, { backgroundColor: '#0ea5e9' }]}
                                  onPress={() => openMaps(c.address)}
                                  activeOpacity={0.8}
                                >
                                  <Ionicons name="location-outline" size={16} color={COLORS.WHITE} />
                                  <Text style={styles.contactPillText}>{c.address}</Text>
                                </TouchableOpacity>
                              ) : null}

                              {/* Horarios */}
                              {c.hours ? (
                                <View style={[styles.contactPill, { backgroundColor: '#f59e0b' }]}>
                                  <Ionicons name="time-outline" size={16} color={COLORS.WHITE} />
                                  <Text style={styles.contactPillText}>{c.hours}</Text>
                                </View>
                              ) : null}

                              {/* Web */}
                              {c.web ? (
                                <TouchableOpacity
                                  style={[styles.contactPill, { backgroundColor: '#10b981' }]}
                                  onPress={() => openWeb(c.web)}
                                  activeOpacity={0.8}
                                >
                                  <Ionicons name="globe-outline" size={16} color={COLORS.WHITE} />
                                  <Text style={styles.contactPillText}>{c.web}</Text>
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20 },
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
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  areasContainer: { paddingBottom: 30 },
  cardWrapper: { marginBottom: 14 },
  areaCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  doubleLogo: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleLogoText: { color: COLORS.WHITE, fontSize: 8, fontWeight: 'bold' },
  textContainer: { flex: 1 },
  areaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK,
    marginBottom: 2,
  },
  areaDescription: { fontSize: 14, color: COLORS.GRAY_MEDIUM, lineHeight: 18 },
  detailBox: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: -10,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  sectionBlock: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY_BLACK,
    marginBottom: 6,
  },
  sectionDesc: { fontSize: 14, color: COLORS.GRAY_DARK, marginBottom: 6, lineHeight: 20 },
  itemsList: { marginTop: 4, marginBottom: 8, gap: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { color: COLORS.PRIMARY_GREEN, fontSize: 16, lineHeight: 20 },
  itemText: { flex: 1, color: COLORS.PRIMARY_BLACK, fontSize: 14, lineHeight: 20 },
  contactsBox: { marginTop: 6, gap: 8 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#22c55e',
  },
  contactPillText: { color: COLORS.WHITE, fontSize: 12, fontWeight: '600' },
});
