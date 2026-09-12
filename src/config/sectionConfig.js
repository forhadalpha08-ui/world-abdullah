/**
 * Planetary Ephemeris & Geospatial Intelligence Configuration
 * Verified scientific data aligned with NASA Earth Observatory, ESA Copernicus,
 * NOAA NESDIS, USGS, and WGS 84 geodetic standards.
 * 
 * 6 Orbital Chapters:
 * 01: ORIGIN     - Orbital Mechanics, Geodesy & Accretion Ephemeris
 * 02: IDENTITY   - Global Hydrosphere, Thermohaline Circulation & Ocean Heat Content
 * 03: VISION     - Atmospheric Stratification, Rayleigh Scattering & Geodynamo Shield
 * 04: CREATION   - Lithospheric Dynamics, Plate Tectonics & Terrestrial Geodynamics
 * 05: EXPERIENCE - Biospheric Carbon Equilibrium, Cryospheric Mass & Overview Effect
 * 06: CONTACT    - Earth Observation Constellations, Global Sensor Grids & Spaceborne Telemetry
 */

export const EARTH_ACTS = [
  {
    key: 'origin',
    index: '01',
    total: '06',
    title: 'ORIGIN',
    tagline: 'Orbital Mechanics & Planetary Geophysics',
    cta: 'MISSION DOSSIER',
    telemetry: {
      semiMajorAxis: '149,598,023 KM (1.000 AU)',
      orbitalVelocity: '29.78 KM/S (107,208 KM/H)',
      planetaryMass: '5.9722 × 10²⁴ KG',
      meanDensity: '5.514 G/CM³ (SOLAR SYSTEM MAX)',
      surfaceGravity: '9.80665 M/S² (STANDARD G)',
      obliquity: '23.4393° (AXIAL TILT)',
      rotationalPeriod: '23H 56M 04.09S (SIDEREAL)',
      equatorialRadius: '6,378.137 KM (WGS 84)'
    },
    narrative: 'Formed 4.543 ± 0.050 billion years ago via accretion from the solar nebula. Primordial gravitational differentiation created an active liquid iron-nickel outer core geodynamo, establishing continuous magnetospheric shielding, stable orbital equilibrium, and the thermodynamic foundation for planetary habitability.'
  },
  {
    key: 'identity',
    index: '02',
    total: '06',
    title: 'IDENTITY',
    tagline: 'Global Hydrosphere & Thermohaline Dynamics',
    cta: 'OCEAN TELEMETRY',
    telemetry: {
      hydrosphereCoverage: '361.9 × 10⁶ KM² (70.85%)',
      totalWaterVolume: '1.386 × 10⁹ KM³',
      meanDepth: '3,682 M (12,080 FT)',
      maxDepth: '10,984 ± 25 M (CHALLENGER DEEP)',
      heatCapacity: '4,184 J/(KG·K) // >90% HEAT SINK',
      amocTransportRate: '15–18 SVERDRUPS (10⁶ M³/S)',
      salinityMean: '34.7 PSU (PRACTICAL SALINITY)',
      oxygenGeneration: '50–85% FROM PHYTOPLANKTON'
    },
    narrative: 'The global ocean acts as Earth\'s primary thermal buffer, absorbing over 90% of excess solar energy from planetary radiative imbalance. The Atlantic Meridional Overturning Circulation (AMOC) continuously transports 1.2 petawatts of tropical heat poleward, stabilizing hemispheric climates and driving marine geochemical cycling.'
  },
  {
    key: 'vision',
    index: '03',
    total: '06',
    title: 'VISION',
    tagline: 'Atmospheric Physics & Magnetospheric Shielding',
    cta: 'SPACE WEATHER DATA',
    telemetry: {
      atmosphericMass: '5.1480 × 10¹⁸ KG',
      surfacePressure: '1013.25 HPA (1.000 ATM)',
      compositionDry: '78.084% N₂ // 20.946% O₂ // 0.934% AR',
      co2Baseline: '424.5 PPM (MAUNA LOA INDEX)',
      troposphereHeight: '8 KM (POLES) – 18 KM (EQUATOR)',
      scaleHeight: '8.5 KM (BAROMETRIC)',
      geomagneticField: '25–65 µT (SURFACE DIPOLE)',
      magnetopauseStandoff: '10–12 EARTH RADII (R_E)'
    },
    narrative: 'Earth\'s atmosphere and geomagnetic envelope form an integrated protective barrier. Rayleigh scattering (\u03bb\u207b\u2074) disperses solar photons into an electric-cyan limb, while the magnetosphere deflects supersonic solar wind plasma (400–750 km/s), funneling high-energy particles into polar auroral ovals at 100–400 km altitude.'
  },
  {
    key: 'creation',
    index: '04',
    total: '06',
    title: 'CREATION',
    tagline: 'Lithospheric Geodynamics & Plate Tectonics',
    cta: 'TECTONIC PROFILER',
    telemetry: {
      lithosphericPlates: '7 MAJOR // 8 MINOR // 60+ MICRO',
      crustalGeneration: '~3.4 KM²/YR AT MID-OCEAN RIDGES',
      driftVelocity: '10–160 MM/YEAR (GPS VERIFIED)',
      internalHeatFlux: '47 ± 2 TERAWATTS',
      volcanicCentres: '~1,500 HOLOCENE ACTIVE',
      bondAlbedo: '0.29–0.31 (CERES MEASURED)',
      crustalThickness: '5–10 KM (OCEANIC) / 30–50 KM (CONT)',
      coreTemperature: '5,400 ± 500 K (INNER CORE BOUNDARY)'
    },
    narrative: 'A thermally dynamic heat engine powered by primordial accretion energy and radiogenic decay (²³⁸U, ²³⁵U, ²³²Th, ⁴⁰K). Subducting oceanic slabs and mantle convection plumes continuously recycle carbon, build continental cratons, and govern long-term geological climate regulation through silicate weathering.'
  },
  {
    key: 'experience',
    index: '05',
    total: '06',
    title: 'EXPERIENCE',
    tagline: 'Biosphere Equilibrium & The Overview Effect',
    cta: 'BIOSPHERE SPECS',
    telemetry: {
      netPrimaryProduction: '105 PETAGRAMS C/YEAR (NPP)',
      cryosphereVolume: '29.9 × 10⁶ KM³ ICE (65M SLE)',
      terrestrialCarbonSink: '3.1 ± 0.6 GTC/YEAR',
      oceanCarbonSink: '2.9 ± 0.4 GTC/YEAR',
      solarIrradianceTSI: '1361.1 W/M² (TOTAL SOLAR IRRADIANCE)',
      radiativeImbalance: '+0.76 ± 0.2 W/M² (EXCESS FORCING)',
      orbitalEccentricity: '0.0167 (MODULATES APHELION/PERIHELION)',
      lunarPerigeeApogee: '363,300 KM – 405,500 KM'
    },
    narrative: 'From low Earth orbit, the cognitive phenomenon of the Overview Effect emerges: artificial geopolitical frontiers dissolve against the fragile razor-thin blue troposphere. All terrestrial biogeochemical cycles—from polar ice albedo feedback to rainforest transpiration—function as a singular thermodynamic organism suspended in vacuum.'
  },
  {
    key: 'contact',
    index: '06',
    total: '06',
    title: 'CONTACT',
    tagline: 'Earth Observation Constellations & Geospatial Uplink',
    cta: 'ORBITAL FLEET HUD',
    telemetry: {
      operationalSatellites: '10,200+ ACTIVE ORBITAL ASSETS',
      earthObservationFleet: '1,250+ REMOTE SENSING PLATFORMS',
      argoOceanFloats: '3,900+ PROFILING AUTONOMOUS BUOYS',
      subseaFiberBackbone: '1.4+ MILLION KM (>99% DATA TRAFFIC)',
      wmoSurfaceStations: '10,000+ CALIBRATED METEOROLOGICAL SITES',
      resolutionSpectral: '0.3M PANCHROMATIC // MULTISPECTRAL',
      trackingEphemeris: 'NORAD SGP4 / TLE REAL-TIME FEEDS',
      interplanetaryBeacon: 'DEEP SPACE NETWORK (DSN) ACTIVE'
    },
    narrative: 'A planetary-scale nervous system comprising spaceborne multi-spectral radar and optical constellations (NASA EOS, Copernicus Sentinel, Landsat, GOES), sub-surface hydrophones, and deep ocean Argo floats. These assets feed continuous petabyte-scale telemetry into global Earth-system models for climate, navigation, and ecological stewardship.'
  }
];

export const SECTION_KEYS = EARTH_ACTS.map((a) => a.key);

export const SECTION_CONFIG = EARTH_ACTS.reduce((acc, a) => {
  acc[a.key] = a;
  return acc;
}, {});
