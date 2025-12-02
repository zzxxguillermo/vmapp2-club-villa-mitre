import { createServer, Model, Factory, Response } from 'miragejs';

export function makeServer({ environment = 'development' } = {}) {
  console.log('🔧 Mirage: Initializing server with mock endpoints');

  const server = createServer({
    environment,

    models: {
      user: Model,
    },

    factories: {
      user: Factory.extend({
        id(i) {
          return String(i);
        },
        nombre() {
          return 'Usuario';
        },
        apellido() {
          return 'Test';
        },
        dni() {
          return '12345678';
        },
        email() {
          return 'test@email.com';
        },
        foto_url() {
          return 'https://via.placeholder.com/150';
        },
        nro_socio() {
          return '001234';
        },
        valido_hasta() {
          return '2024-12-31';
        },
        codigo_barras() {
          return '123456789012';
        },
        estado_cuenta() {
          return {
            al_dia: true,
            cuotas_adeudadas: 0,
            monto_adeudado: 0,
            proximo_vencimiento: '2024-02-15',
            ultimo_pago: '2024-01-15',
            monto_ultimo_pago: 15000,
          };
        },
      }),
    },

    seeds(server) {
      // Create test users with different password types
      server.create('user', {
        id: '1',
        nombre: 'Santiago',
        apellido: 'García',
        dni: '12345678',
        email: 'santiago@email.com',
        user_type: 'api',
        password: '123456789', // Solo números
      });

      server.create('user', {
        id: '2',
        nombre: 'María',
        apellido: 'López',
        dni: '87654321',
        email: 'maria@email.com',
        user_type: 'api',
        password: 'abc123def', // Letras y números
      });

      server.create('user', {
        id: '3',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        dni: '11223344',
        email: 'carlos@email.com',
        user_type: 'local',
        password: 'MiPassword2024!', // Letras, números y símbolos
      });

      // Usuario del contrato API
      server.create('user', {
        id: '4',
        nombre: 'Usuario',
        apellido: 'API Test',
        dni: '59964604',
        email: 'test@api.com',
        user_type: 'api',
        password: '123456789', // Del contrato API
      });

      // Usuario con problema reportado
      server.create('user', {
        id: '5',
        nombre: 'Usuario',
        apellido: 'Problema',
        dni: '58964605',
        email: 'problema@test.com',
        user_type: 'api',
        password: 'Zzxx4518688', // Password con letras y números
      });
    },

    routes() {
      this.namespace = 'api';
      this.timing = 1000; // Simulate network delay

      // Authentication endpoints
      this.post('/auth/login', (schema, request) => {
        const { dni, password } = JSON.parse(request.requestBody);
        console.log('🔐 Mirage LOGIN:', { dni, password });

        // Simple validation
        if (!dni || !password) {
          return new Response(
            422,
            {},
            {
              success: false,
              message: 'DNI y contraseña son requeridos',
              errors: {
                dni: dni ? [] : ['El DNI es requerido'],
                password: password ? [] : ['La contraseña es requerida'],
              },
            }
          );
        }

        // Buscar usuario por DNI
        const user = schema.db.users.findBy({ dni });

        if (!user) {
          return new Response(
            401,
            {},
            {
              success: false,
              message: 'DNI no encontrado',
              errors: {
                dni: ['El DNI no está registrado'],
              },
            }
          );
        }

        // Verificar contraseña
        if (user.password && user.password !== password) {
          return new Response(
            401,
            {},
            {
              success: false,
              message: 'Contraseña incorrecta',
              errors: {
                password: ['La contraseña es incorrecta'],
              },
            }
          );
        }

        // Login exitoso
        return new Response(
          200,
          {},
          {
            success: true,
            data: {
              user: user,
              token: 'mock_jwt_token_' + Date.now(),
            },
            message: 'Login exitoso',
          }
        );
      });

      this.post('/auth/register', (schema, request) => {
        const userData = JSON.parse(request.requestBody);
        console.log('📝 Mirage REGISTER:', userData);

        const { name, email, password, password_confirmation, dni, phone } = userData;

        // Validation
        if (!name || !email || !password || !dni) {
          return new Response(
            422,
            {},
            {
              success: false,
              message: 'Todos los campos son requeridos',
              errors: {
                name: name ? [] : ['El nombre es requerido'],
                email: email ? [] : ['El email es requerido'],
                password: password ? [] : ['La contraseña es requerida'],
                dni: dni ? [] : ['El DNI es requerido'],
              },
            }
          );
        }

        if (password !== password_confirmation) {
          return new Response(
            422,
            {},
            {
              success: false,
              message: 'Las contraseñas no coinciden',
              errors: {
                password_confirmation: ['Las contraseñas no coinciden'],
              },
            }
          );
        }

        // Check if user already exists
        const existingUser = schema.db.users.findBy({ email });
        if (existingUser) {
          return new Response(
            422,
            {},
            {
              success: false,
              message: 'El usuario ya existe',
              errors: {
                email: ['Este email ya está registrado'],
              },
            }
          );
        }

        // Create new user
        const newUser = schema.create('user', {
          nombre: name.split(' ')[0] || name,
          apellido: name.split(' ').slice(1).join(' ') || 'Usuario',
          email,
          dni,
          foto_url: 'https://via.placeholder.com/150',
          nro_socio: String(Math.floor(Math.random() * 999999)).padStart(6, '0'),
          valido_hasta: '2024-12-31',
          codigo_barras: String(Math.floor(Math.random() * 999999999999)),
          estado_cuenta: {
            al_dia: true,
            cuotas_adeudadas: 0,
            monto_adeudado: 0,
            proximo_vencimiento: '2024-02-15',
            ultimo_pago: '2024-01-15',
            monto_ultimo_pago: 15000,
          },
        });

        return new Response(
          201,
          {},
          {
            success: true,
            data: {
              user: newUser,
              token: 'mock_jwt_token_' + Date.now(),
            },
            message: 'Usuario registrado exitosamente',
          }
        );
      });

      this.post('/auth/logout', () => {
        return new Response(
          200,
          {},
          {
            success: true,
            message: 'Logout exitoso',
          }
        );
      });

      this.get('/auth/user', (schema) => {
        const user = schema.db.users[0];
        return new Response(
          200,
          {},
          {
            success: true,
            data: { user: user },
          }
        );
      });

      // Carnet endpoint
      this.get('/user/carnet', (schema) => {
        const user = schema.db.users[0];
        return new Response(
          200,
          {},
          {
            success: true,
            data: user,
          }
        );
      });
    },
  });

  if (__DEV__) {
    console.log('✅ Mirage: Server initialized with mock endpoints');
  }

  return server;
}
