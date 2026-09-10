# Simulador de Algoritmos de Planificación de CPU

Simulador web interactivo de algoritmos de planificación de procesos, desarrollado
para la Actividad 2 de Sistemas Operativos. Permite cargar procesos, elegir un
algoritmo, ajustar sus parámetros y comparar resultados (diagrama de Gantt y
métricas) en tiempo real, todo desde el navegador.

## Algoritmos incluidos

- **FIFO** (First In, First Out)
- **SJF** (Shortest Job First, no expropiativo)
- **Round Robin** (con quantum configurable)
- **Prioridad** (modo expropiativo y no expropiativo)
- **MLFQ** (Multilevel Feedback Queue, con niveles configurables)

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (modo estricto)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/) para el diagrama de Gantt

Todo el cálculo se hace en el cliente, sin backend.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- npm (incluido con Node.js)

## Cómo inicializar el proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/Perez2409/simulador-so-actividad2.git
cd simulador-so-actividad2

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

Esto abre el proyecto en `http://localhost:5173/`.

### Otros comandos disponibles

```bash
npm run build    # compila TypeScript y genera el build de producción en dist/
npm run preview  # sirve localmente el build de producción
npm run lint     # corre ESLint sobre todo el proyecto
```

## Estructura del proyecto

```
src/
├── algorithms/        # Lógica pura de planificación, sin nada de interfaz
│   ├── fifo.ts
│   ├── sjf.ts
│   ├── roundRobin.ts
│   ├── priority.ts
│   ├── mlfq.ts
│   ├── metrics.ts     # Cálculo compartido de espera/retorno/respuesta
│   └── types.ts        # Contrato de datos (Process, SimulationResult, etc.)
├── components/         # Interfaz: formulario de procesos, parámetros,
│   │                    # diagrama de Gantt y tabla de métricas
│   └── ui/              # Componentes base de shadcn/ui
├── App.tsx
└── main.tsx
```

Los algoritmos no dependen de la interfaz, y la interfaz no conoce el
funcionamiento interno de cada algoritmo: todos devuelven el mismo contrato
(`SimulationResult`), lo que permite agregar o modificar algoritmos sin tocar
el resto de la aplicación.
