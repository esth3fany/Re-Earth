import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- DADOS DE CONFIGURAÇÃO ---
const MODULE_TYPES = {
    'Residência': { 
        color: 0xbe123c, 
        icon: 'home',
        modelUrl: 'modelos/house.glb', 
        modelScale: 0.002,
        area: 50,
        energyConsumption: 5,
        waterConsumption: 150,
        foodConsumption: 3,
    },
    'Painel Solar': {
        color: 0x0e7490,
        icon: 'sun',
        modelUrl: 'modelos/painel_solar.glb',
        modelScale: 0.25,
        area: 10,
        energyProduction: 20,
    },
    'Turbina Eólica': {
        color: 0x9ca3af,
        icon: 'wind',
        modelUrl: 'modelos/wind_mill.glb',
        modelScale: 0.01,
        area: 5,
        energyProduction: 30,
    },
    'Coletor de Chuva': {
        color: 0x1d4ed8,
        icon: 'cloud-rain',
        modelUrl: 'modelos/rain_water_collector_idea_model_2.glb',
        modelScale: 0.3,
        area: 20,
        waterProduction: 500,
    },
    'Horta Hidropônica': {
        color: 0x16a34a,
        icon: 'leaf',
        modelUrl: 'modelos/greenhouse_free.glb',
        modelScale: 0.025,
        area: 25,
        foodProduction: 30,
        energyConsumption: 10,
        waterConsumption: 50
    },
    'Composteira': { 
        color: 0x7c2d12,
        icon: 'recycle',
        modelUrl: 'modelos/compost_bin_free.glb',
        modelScale: 0.02,
        area: 6,
        description: 'Processa resíduos orgânicos.'
    },
    'Biodigestor': { 
        color: 0x4a044e,
        icon: 'flame',
        modelUrl: 'modelos/biodigestor.glb',
        modelScale: 1,
        area: 15,
        energyProduction: 15,
        description: 'Converte lixo em biogás.'
    },
};

const MODULE_ICONS = {
    'home': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
    'sun': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
    'wind': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 6.6a9 9 0 00-14.8 0" /><path stroke-linecap="round" stroke-linejoin="round" d="M4.6 17.4a9 9 0 0014.8 0" /></svg>`,
    'cloud-rain': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 19v2m-3-3v2m6-2v2" /></svg>`,
    'leaf': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    'recycle': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>`,
    'flame': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 2a8.003 8.003 0 016.014 2.986C20.5 5 21 8 21 10c2 1 2.657 1.343 2.657 2.657a8 8 0 01-1.343 5.657z" /></svg>`,
    'default': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>`
};

const CHECKLIST_ITEMS = ['Balanço Energético Positivo', 'Autossuficiência Hídrica', 'Produção de Alimentos Suficiente'];
const INITIAL_CAMERA_POS = new THREE.Vector3(30, 30, 40);

// --- Componentes Core do Three.js ---
let scene, renderer, orbitControls, transformControls, raycaster;
let camera, groundPlane, environmentGroup;
let ambientLight, directionalLight;
const clock = new THREE.Clock();

// --- Sistemas de Partículas e Vento (SHADER) ---
let rainSystem, rainGeo;
const rainCount = 8000;

const windUniforms = {
    uTime: { value: 0 },
    uWindStrength: { value: 0.1 },
    uWindSpeed: { value: 1.0 }
};

const pointer = new THREE.Vector2();
const placedModules = [];

// --- Variáveis de Colisão ---
let lastValidPosition = new THREE.Vector3();
const originalMaterials = new Map();

// --- Loaders ---
const loadingManager = new THREE.LoadingManager();
let gltfLoader;
const placeholderMaterialCache = {};

// --- Elementos DOM ---
let canvasContainer;
let energyBalanceEl, waterBalanceEl, foodBalanceEl;
let energyBar, waterBar, foodBar;
let alertsListEl, checklistListEl;
let selectedModuleInfoEl, selectedModuleNameEl, selectedModuleDetailsEl;
let collisionWarningEl;

// --- Estado da Aplicação ---
let projectParams = { 
    numMoradores: 4, 
    climateMultiplier: 1.0,
};
let designState = { 
    snapGridSize: 0.5 
};

// --- INICIALIZAÇÃO ---
function init() {
    canvasContainer = document.getElementById('canvas-container');
    energyBalanceEl = document.getElementById('energy-balance');
    waterBalanceEl = document.getElementById('water-balance');
    foodBalanceEl = document.getElementById('food-balance');
    energyBar = document.getElementById('energy-bar');
    waterBar = document.getElementById('water-bar');
    foodBar = document.getElementById('food-bar');
    alertsListEl = document.getElementById('alerts-list');
    checklistListEl = document.getElementById('checklist-list');
    selectedModuleInfoEl = document.getElementById('selected-module-info');
    selectedModuleNameEl = document.getElementById('selected-module-name');
    selectedModuleDetailsEl = document.getElementById('selected-module-details');
    collisionWarningEl = document.getElementById('collision-warning');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 20, 200);

    camera = new THREE.PerspectiveCamera(60, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.copy(INITIAL_CAMERA_POS);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    gltfLoader = new GLTFLoader(loadingManager);

    setupLights();
    createRain(); 
    
    updateSceneClimate('1.0'); 
    
    setupControls(); // Aqui entra a nova lógica de controles
    loadAssets();
    setupUI();
    
    runAnalysis();
    animate();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    canvasContainer.addEventListener('pointerdown', onCanvasClick);
    canvasContainer.addEventListener('dragover', (e) => e.preventDefault());
    canvasContainer.addEventListener('drop', onDrop);
}

// --- SISTEMA DE COLISÃO (NOVO) ---

function checkCollision(target) {
    const targetBox = new THREE.Box3().setFromObject(target);
    // Reduz levemente a caixa para evitar colisão por "encostar" apenas
    targetBox.expandByScalar(-0.1); 

    // Itera APENAS sobre placedModules, ignorando environmentGroup (árvores)
    for (let module of placedModules) {
        if (module === target) continue; // Não comparar consigo mesmo

        const moduleBox = new THREE.Box3().setFromObject(module);
        moduleBox.expandByScalar(-0.1);

        if (targetBox.intersectsBox(moduleBox)) {
            return true; // Colisão detectada!
        }
    }
    return false;
}

function updateCollisionVisuals(object, isColliding) {
    object.traverse((child) => {
        if (child.isMesh) {
            if (!originalMaterials.has(child.uuid)) {
                originalMaterials.set(child.uuid, child.material.clone());
            }

            if (isColliding) {
                if (child.material.name !== 'collision-mat') {
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xff0000,
                        opacity: 0.5,
                        transparent: true,
                        wireframe: true,
                        name: 'collision-mat'
                    });
                }
            } else {
                if (originalMaterials.has(child.uuid)) {
                    child.material = originalMaterials.get(child.uuid);
                }
            }
        }
    });
}

function restoreObjectMaterials(object) {
    object.traverse((child) => {
        if (child.isMesh && originalMaterials.has(child.uuid)) {
            child.material = originalMaterials.get(child.uuid);
        }
    });
    originalMaterials.clear();
}

// --- LUZES E AMBIENTE ---
function setupLights() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
    scene.add(ambientLight);
    
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(-50, 80, 30);
    directionalLight.castShadow = true;
    
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.bias = -0.0005;
    directionalLight.shadow.radius = 2; 
    
    scene.add(directionalLight);
}

function createRain() {
    rainGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < rainCount; i++) {
        positions.push(Math.random() * 400 - 200);
        positions.push(Math.random() * 200);
        positions.push(Math.random() * 400 - 200);
    }
    rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
        color: 0xaaaaaa, size: 0.2, transparent: true, opacity: 0.8
    });
    rainSystem = new THREE.Points(rainGeo, rainMat);
    rainSystem.visible = false;
    scene.add(rainSystem);
}

function updateRain() {
    if (!rainSystem || !rainSystem.visible) return;
    const positions = rainGeo.attributes.position.array;
    for (let i = 1; i < rainCount * 3; i += 3) {
        positions[i] -= 1.5;
        if (positions[i] < 0) positions[i] = 200;
    }
    rainGeo.attributes.position.needsUpdate = true;
}

function updateSceneClimate(climateValue) {
    rainSystem.visible = String(climateValue) === '0.8';

    switch (String(climateValue)) {
        case '1.2': 
            scene.background = new THREE.Color(0x00BFFF); 
            scene.fog = new THREE.Fog(0x00BFFF, 80, 400); 
            ambientLight.intensity = 0.6;
            directionalLight.intensity = 1.5;
            directionalLight.color.setHex(0xFFFACD);
            windUniforms.uWindStrength.value = 0.7; 
            windUniforms.uWindSpeed.value = 2.0; 
            break;
        
        case '0.8':
            scene.background = new THREE.Color(0x374151); 
            scene.fog = new THREE.Fog(0x374151, 10, 150);
            ambientLight.intensity = 0.4;
            directionalLight.intensity = 0.5;
            directionalLight.color.setHex(0xaaccff);
            windUniforms.uWindStrength.value = 1.2;
            windUniforms.uWindSpeed.value = 3.0;
            break;

        case '1.0': 
        default:
            scene.background = new THREE.Color(0x87CEEB); 
            scene.fog = new THREE.Fog(0x87CEEB, 60, 300);
            ambientLight.intensity = 0.7;
            directionalLight.intensity = 1.1;
            directionalLight.color.setHex(0xFFFFFF);
            windUniforms.uWindStrength.value = 0.15;
            windUniforms.uWindSpeed.value = 0.8;
            break;
    }
}

// --- CONTROLES (ATUALIZADO COM COLISÃO) ---
function setupControls() {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.1; 
    orbitControls.rotateSpeed = 0.8;   
    orbitControls.zoomSpeed = 1.2;     
    orbitControls.panSpeed = 0.8;      
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;

    transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls);
    
    // Evento: Iniciou ou Terminou de Arrastar
    transformControls.addEventListener('dragging-changed', event => { 
        orbitControls.enabled = !event.value; 
        
        if (event.value) {
            // Começou a arrastar: Salva posição válida
            if (transformControls.object) {
                lastValidPosition.copy(transformControls.object.position);
            }
        } else {
            // Soltou o objeto
            const object = transformControls.object;
            if (object) {
                if (checkCollision(object)) {
                    // Colisão detectada: Reseta posição e materiais
                    object.position.copy(lastValidPosition);
                    updateCollisionVisuals(object, false);
                    if (collisionWarningEl) collisionWarningEl.classList.add('hidden');
                } else {
                    // Posição válida: Snap e restaura materiais
                    snapToGrid(object);
                    restoreObjectMaterials(object);
                    if (collisionWarningEl) collisionWarningEl.classList.add('hidden');
                }
                runAnalysis();
            }
        }
    });

    // Evento: Durante o Arrastar
    transformControls.addEventListener('change', () => {
        if (transformControls.dragging && transformControls.object) {
            const object = transformControls.object;
            const isColliding = checkCollision(object);
            
            // Feedback visual imediato
            updateCollisionVisuals(object, isColliding);
            
            if (collisionWarningEl) {
                if (isColliding) collisionWarningEl.classList.remove('hidden');
                else collisionWarningEl.classList.add('hidden');
            }
        } else {
            runAnalysis();
        }
    });
}

function loadAssets() {
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(25, 25); 
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); 
    });

    const groundMat = new THREE.MeshLambertMaterial({ 
        map: groundTexture,
        color: 0xaaaaaa 
    });
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.receiveShadow = true;
    groundPlane.userData.isGround = true;
    scene.add(groundPlane);

    createEnvironmentFeatures();
}

// --- ÁRVORES (NÃO ENTRAM NO placedModules) ---
function createEnvironmentFeatures() {
    environmentGroup = new THREE.Group();

    const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x5C4033 });
    treeTrunkMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = windUniforms.uTime;
        shader.uniforms.uWindStrength = windUniforms.uWindStrength;
        shader.uniforms.uWindSpeed = windUniforms.uWindSpeed;
        
        shader.vertexShader = `
            uniform float uTime;
            uniform float uWindStrength;
            uniform float uWindSpeed;
            vec3 getTrunkDisplacement(vec3 pos, float t, float strength, float speed) {
                float sway = sin(t * speed * 0.5 + pos.z * 0.3);
                float flexibility = pow(max(0.0, pos.y - 0.5), 2.0) * 0.05;
                float movement = sway * strength * flexibility;
                return vec3(movement, 0.0, movement * 0.2);
            }
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            transformed += getTrunkDisplacement(position, uTime, uWindStrength, uWindSpeed);
            `
        );
    };

    const treeLeavesMat = new THREE.MeshLambertMaterial({ color: 0x3A5F0B });
    treeLeavesMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = windUniforms.uTime;
        shader.uniforms.uWindStrength = windUniforms.uWindStrength;
        shader.uniforms.uWindSpeed = windUniforms.uWindSpeed;
        
        shader.vertexShader = `
            uniform float uTime;
            uniform float uWindStrength;
            uniform float uWindSpeed;
            float hash(float n) { return fract(sin(n) * 43758.5453123); }
            float noise(vec3 x) {
                vec3 p = floor(x);
                vec3 f = fract(x);
                f = f*f*(3.0-2.0*f);
                float n = p.x + p.y*57.0 + 113.0*p.z;
                return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                                mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                           mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                                mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
            }
            vec3 getFoliageDisplacement(vec3 pos, float t, float strength, float speed) {
                float mainSway = sin(t * speed * 0.6 + pos.x * 0.1 + pos.z * 0.1) * strength * 0.3 * max(0.0, pos.y - 2.0);
                vec3 flutter = vec3(
                    noise(pos * 2.0 + vec3(t * speed * 3.0, 0.0, 0.0)),
                    noise(pos * 2.0 + vec3(0.0, t * speed * 3.5, 0.0)),
                    noise(pos * 2.0 + vec3(0.0, 0.0, t * speed * 3.0))
                );
                float edgeFactor = distance(pos, vec3(0.0, 6.0, 0.0)) * 0.1;
                flutter = (flutter - 0.5) * strength * 0.8 * edgeFactor;
                return vec3(mainSway + flutter.x, flutter.y * 0.5, mainSway * 0.5 + flutter.z);
            }
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            transformed += getFoliageDisplacement(position + vec3(transformed.x + transformed.z), uTime, uWindStrength, uWindSpeed);
            `
        );
    };

    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 4.5, 9);
    const leavesGeo = new THREE.IcosahedronGeometry(3.2, 1); 

    for (let i = 0; i < 60; i++) { 
        const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
        const leaves = new THREE.Mesh(leavesGeo, treeLeavesMat);
        
        trunk.castShadow = true; trunk.receiveShadow = true;
        leaves.castShadow = true; leaves.receiveShadow = true;

        const tree = new THREE.Group();
        trunk.position.y = 2.25;
        leaves.position.y = 6.5;
        
        leaves.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

        tree.add(trunk, leaves);
        
        const angle = Math.random() * Math.PI * 2;
        const radius = 50 + Math.random() * 130;
        tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        
        const scaleY = 0.8 + Math.random() * 0.6; 
        const scaleXZ = 0.7 + Math.random() * 0.5; 
        tree.scale.set(scaleXZ, scaleY, scaleXZ);

        environmentGroup.add(tree);
    }
    // Adiciona ao grupo, mas NÃO adiciona ao placedModules
    scene.add(environmentGroup);
}

function onWindowResize() {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

function onKeyDown(event) {
    // Evita que o comando rode se o usuário estiver digitando em algum input (se houver no futuro)
    if (event.target.tagName === 'INPUT') return;

    switch(event.key.toLowerCase()) {
        case 'w': 
            // Muda o gizmo para modo de Mover
            if (transformControls.object) {
                transformControls.setMode('translate');
                transformControls.showX = true;
                transformControls.showZ = true;
                transformControls.showY = true; // Permite mover altura se necessário
            }
            break;

        case 'e': 
            // Muda o gizmo para modo de Rotação
            if (transformControls.object) {
                transformControls.setMode('rotate'); 
                transformControls.showX = false;
                transformControls.showZ = false;
                transformControls.showY = true; // Rotação apenas no eixo Y (o mais comum para casas)
            }
            break;

        case 'q': 
        case 'delete': 
        case 'backspace': // Adicionado backspace por segurança
            deleteSelectedObject(); 
            break;

        case 'escape': 
            deselectObject(); 
            break;
    }
}

function onCanvasClick(event) {
    if (transformControls.dragging) return;
    
    pointer.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = - (event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(placedModules, true);

    if (intersects.length > 0) {
        let objectToSelect = intersects[0].object;

        while (objectToSelect.parent && !placedModules.includes(objectToSelect)) {
            objectToSelect = objectToSelect.parent;
        }

        if (placedModules.includes(objectToSelect)) {
            selectObject(objectToSelect);
        }
    } else {
        deselectObject();
    }
}

// --- DROP (ATUALIZADO: EVITA DROP EM CIMA DE OUTRO) ---
function onDrop(event) {
    event.preventDefault();
    const moduleName = event.dataTransfer.getData("text/plain");
    const config = MODULE_TYPES[moduleName];
    if (!config) return;

    pointer.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = - (event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // Intersecta APENAS o chão para saber onde colocar
    const intersects = raycaster.intersectObject(groundPlane);
    if (intersects.length > 0) {
        const point = intersects[0].point;

        // Verifica se já existe algo ali
        const tempBox = new THREE.Box3();
        const size = 4; // Tamanho aproximado do módulo
        tempBox.setFromCenterAndSize(point, new THREE.Vector3(size, size, size));

        let canPlace = true;
        for (let module of placedModules) {
            const moduleBox = new THREE.Box3().setFromObject(module);
            if (tempBox.intersectsBox(moduleBox)) {
                canPlace = false;
                break;
            }
        }

        if (canPlace) {
            addModule(moduleName, config, point);
            if (collisionWarningEl) collisionWarningEl.classList.add('hidden');
        } else {
            // Mostra aviso temporário
            if (collisionWarningEl) {
                collisionWarningEl.innerText = "🚫 Espaço Ocupado!";
                collisionWarningEl.classList.remove('hidden');
                setTimeout(() => {
                    collisionWarningEl.classList.add('hidden');
                    collisionWarningEl.innerText = "🚫 LOCAL INVÁLIDO: COLISÃO DETECTADA";
                }, 1500);
            }
        }
    }
}

function setupUI() {
    const backBtn = document.getElementById('back-to-home-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    /*const helpBox = document.querySelector('#canvas-container .absolute p:nth-child(2)');
    if(helpBox) helpBox.innerHTML = '⌨️ Teclas: <span class="font-normal text-green-700">W: Mover | E: Girar | Q/Del: Deletar | ESC: Desselecionar</span>';*/

    document.getElementById('clear-modules-btn').addEventListener('click', clearAllModules);
    document.getElementById('clear-modules-btn').addEventListener('click', clearAllModules);
    document.getElementById('delete-module-btn').addEventListener('click', deleteSelectedObject);
    
    const moradoresSlider = document.getElementById('num-moradores');
    const moradoresValue = document.getElementById('num-moradores-value');
    moradoresSlider.addEventListener('input', e => {
        projectParams.numMoradores = parseInt(e.target.value);
        moradoresValue.textContent = projectParams.numMoradores;
        runAnalysis();
    });

    const climateSelect = document.getElementById('climate-multiplier');
    climateSelect.addEventListener('change', e => {
        const value = e.target.value;
        projectParams.climateMultiplier = parseFloat(value);
        updateSceneClimate(value);
        runAnalysis();
    });

    document.getElementById('download-btn').addEventListener('click', downloadState);
    const loadInput = document.getElementById('load-input');
    document.getElementById('load-btn').addEventListener('click', () => loadInput.click());
    loadInput.addEventListener('change', loadStateFromFile);
    
    
    const modulePalette = document.getElementById('module-palette');
    Object.entries(MODULE_TYPES).forEach(([name, config]) => {
        const button = document.createElement('div');
        button.draggable = true;
        button.dataset.moduleName = name;
        
        // ESTILO NOVO: Dark Slot Game Style
        button.className = 'group flex flex-col items-center justify-center p-3 bg-gray-900 rounded-xl border border-gray-700 cursor-grab transition-all hover:border-emerald-500 hover:bg-gray-800 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95';
        
        // Ícone colorido quando hover
        button.innerHTML = `
            <div class="text-gray-400 group-hover:text-white transition-colors mb-2 scale-110">${MODULE_ICONS[config.icon] || MODULE_ICONS['default']}</div>
            <span class="text-[10px] font-bold text-gray-400 group-hover:text-emerald-300 text-center leading-tight uppercase tracking-wide">${name}</span>
        `;
        
        button.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData("text/plain", name);
            event.dataTransfer.effectAllowed = "copy";
        });
        modulePalette.appendChild(button);
    });
    

    populateChecklist();
}

function getPlaceholderMaterial(config) {
    if (!placeholderMaterialCache[config.color]) {
        placeholderMaterialCache[config.color] = new THREE.MeshLambertMaterial({ color: config.color });
    }
    return placeholderMaterialCache[config.color];
}

function addModule(name, config, position, rotation, scale) {
    if (config.modelUrl) {
        gltfLoader.load(
            config.modelUrl, 
            (gltf) => {
                const model = gltf.scene;
                model.traverse(node => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });

                position.y = 0; 
                model.position.copy(position);
                
                if (rotation) {
                    model.quaternion.copy(rotation);
                }
                if (scale) {
                    model.scale.copy(scale);
                } else if (config.modelScale) {
                    model.scale.set(config.modelScale, config.modelScale, config.modelScale);
                }

                model.userData = { name, config, isModel: true };
                
                scene.add(model);
                placedModules.push(model);
                snapToGrid(model);
                selectObject(model);
                runAnalysis();
            },
            undefined, 
            (error) => {
                console.error(`Erro ao carregar modelo ${name} (${config.modelUrl}):`, error);
                addFallbackModule(name, config, position, rotation, scale);
            }
        );
    } else {
        addFallbackModule(name, config, position, rotation, scale);
    }
}

function addFallbackModule(name, config, position, rotation, scale) {
    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = getPlaceholderMaterial(config);
    const module = new THREE.Mesh(geometry, material);
    
    position.y = 2; 
    module.position.copy(position);
    
    if (rotation) module.quaternion.copy(rotation);
    if (scale) module.scale.copy(scale);

    module.castShadow = true;
    module.receiveShadow = true;
    module.userData = { name, config, isModel: false };
    
    scene.add(module);
    placedModules.push(module);
    snapToGrid(module);
    selectObject(module);
    runAnalysis();
}

function clearAllModules() {
    deselectObject();
    [...placedModules].forEach(module => {
        if (module.isMesh) {
            module.geometry.dispose();
            module.material.dispose();
        } else if (module.isGroup) {
            module.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
        }
        scene.remove(module);
    });
    placedModules.length = 0;
    runAnalysis();
}

function snapToGrid(object) {
    if (!object) return;
    const gridSize = designState.snapGridSize;
    object.position.x = Math.round(object.position.x / gridSize) * gridSize;
    object.position.z = Math.round(object.position.z / gridSize) * gridSize;
    
    const box = new THREE.Box3().setFromObject(object);
    const height = box.max.y - box.min.y;
    const modelBaseY = box.min.y;
    
    if (object.userData.isModel) {
        object.position.y -= modelBaseY;
    } else {
        object.position.y = height / 2;
    }

    runAnalysis();
}

function selectObject(object) {
    transformControls.attach(object);
    selectedModuleInfoEl.classList.remove('hidden');
    updateSelectedModuleInfo(object);
}

function deselectObject() {
    transformControls.detach();
    selectedModuleInfoEl.classList.add('hidden');
    if(collisionWarningEl) collisionWarningEl.classList.add('hidden');
}

function deleteSelectedObject() {
    const selected = transformControls.object;
    if (!selected) return;
    const index = placedModules.indexOf(selected);
    if (index > -1) placedModules.splice(index, 1);
    
    if (selected.isMesh) {
        selected.geometry.dispose();
        selected.material.dispose();
    } else if (selected.isGroup) {
        selected.traverse(child => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
    }
    scene.remove(selected);
    
    deselectObject();
    runAnalysis();
}

function runAnalysis() {
    let totals = {
        energyProduction: 0, energyConsumption: 0,
        waterProduction: 0, waterConsumption: 0,
        foodProduction: 0, foodConsumption: 0,
    };
    const alerts = new Set();
    const { numMoradores, climateMultiplier } = projectParams;

    placedModules.forEach(module => {
        const { name, config } = module.userData;
        if (!config) return;
        
        const multiplier = (name === 'Painel Solar' || name === 'Turbina Eólica' || name === 'Coletor de Chuva') ? climateMultiplier : 1;
        
        if (name === 'Residência') {
            totals.energyConsumption += (config.energyConsumption || 0) * numMoradores;
            totals.waterConsumption += (config.waterConsumption || 0) * numMoradores;
            totals.foodConsumption += (config.foodConsumption || 0) * numMoradores;
        } else {
            totals.energyProduction += (config.energyProduction || 0) * multiplier;
            totals.energyConsumption += (config.energyConsumption || 0);
            totals.waterProduction += (config.waterProduction || 0) * multiplier;
            totals.waterConsumption += (config.waterConsumption || 0);
            totals.foodProduction += (config.foodProduction || 0);
            totals.foodConsumption += (config.foodConsumption || 0);
        }
    });

    const energyBalance = totals.energyProduction - totals.energyConsumption;
    const waterBalance = totals.waterProduction - totals.waterConsumption;
    const foodBalance = totals.foodProduction - totals.foodConsumption;

    if (energyBalance < 0) alerts.add(`Déficit de energia: ${energyBalance.toFixed(0)} kWh/dia. Adicione mais módulos.`);
    if (waterBalance < 0) alerts.add(`Déficit de água: ${waterBalance.toFixed(0)} L/dia. Adicione mais coletores.`);
    if (foodBalance < 0) alerts.add(`Déficit de comida: ${foodBalance.toFixed(0)} porções/dia. Adicione mais hortas.`);

    updateDashboardUI(totals, { energyBalance, waterBalance, foodBalance });
    updateAlertsUI(alerts);
    updateChecklistUI({ energyBalance, waterBalance, foodBalance });
    if (transformControls.object) updateSelectedModuleInfo(transformControls.object);
}

function updateDashboardUI(totals, balances) {
    energyBalanceEl.textContent = `${balances.energyBalance.toFixed(0)} kWh/dia`;
    waterBalanceEl.textContent = `${balances.waterBalance.toFixed(0)} L/dia`;
    foodBalanceEl.textContent = `${balances.foodBalance.toFixed(0)} porções/dia`;

    const updateBar = (barEl, balance, production) => {
        let percentage = 50;
        if (production > 0 || balance < 0) {
            const totalConsumption = production - balance;
            if (totalConsumption > 0) {
                percentage = (production / totalConsumption) * 100;
            } else if (balance < 0) {
                percentage = 0;
            }
        }
        percentage = Math.max(0, Math.min(100, percentage));
        barEl.style.width = `${percentage}%`;
        
        barEl.classList.toggle('bg-gradient-to-r', balance >= 0);
        barEl.classList.toggle('from-red-400', balance < 0);
        barEl.classList.toggle('to-red-600', balance < 0);
    };

    updateBar(energyBar, balances.energyBalance, totals.energyProduction);
    updateBar(waterBar, balances.waterBalance, totals.waterProduction);
    updateBar(foodBar, balances.foodBalance, totals.foodProduction);
}

function populateChecklist() {
    checklistListEl.innerHTML = '';
    CHECKLIST_ITEMS.forEach(name => {
        const li = document.createElement('li');
        li.id = `checklist-${name.replace(/\s+/g, '-')}`;
        li.innerHTML = `<span class="mr-2">❌</span> ${name}`;
        li.className = 'text-red-600'; 
        checklistListEl.appendChild(li);
    });
}

function updateChecklistUI(balances) {
    const check = (name, condition) => {
        const li = document.getElementById(`checklist-${name.replace(/\s+/g, '-')}`);
        if (li) {
            li.className = condition ? 'text-green-600' : 'text-red-600';
            li.querySelector('span').innerHTML = condition ? '✅' : '❌';
        }
    };
    check(CHECKLIST_ITEMS[0], balances.energyBalance >= 0);
    check(CHECKLIST_ITEMS[1], balances.waterBalance >= 0);
    check(CHECKLIST_ITEMS[2], balances.foodBalance >= 0);
}

function updateAlertsUI(alerts) {
    alertsListEl.innerHTML = alerts.size === 0 
        ? '<li class="text-green-600">✓ Nenhum alerta no momento!</li>'
        : [...alerts].map(alert => `<li class="text-red-600">${alert}</li>`).join('');
}

function updateSelectedModuleInfo(module) {
    const { name, config } = module.userData;
    selectedModuleNameEl.textContent = name;
    let detailsHtml = '';
    if (config.energyProduction) detailsHtml += `<p>⚡ Produção: <span class="font-mono">${(config.energyProduction * projectParams.climateMultiplier).toFixed(0)} kWh/dia</span></p>`;
    if (config.energyConsumption) detailsHtml += `<p>⚡ Consumo: <span class="font-mono">${config.energyConsumption} kWh/dia</span></p>`;
    if (config.waterProduction) detailsHtml += `<p>💧 Produção: <span class="font-mono">${(config.waterProduction * projectParams.climateMultiplier).toFixed(0)} L/dia</span></p>`;
    if (config.waterConsumption) detailsHtml += `<p>💧 Consumo: <span class="font-mono">${config.waterConsumption} L/dia</span></p>`;
    if (config.foodProduction) detailsHtml += `<p>🥕 Produção: <span class="font-mono">${config.foodProduction} porções/dia</span></p>`;
    if (config.description) detailsHtml += `<p class="text-purple-600">${config.description}</p>`;
    selectedModuleDetailsEl.innerHTML = detailsHtml;
}

function generateStateJSON() {
    const state = {
        projectParams,
        placedModules: placedModules.map(m => ({
            name: m.userData.name,
            transform: {
                position: m.position.toArray(),
                quaternion: m.quaternion.toArray(),
                scale: m.scale.toArray()
            }
        }))
    };
    return JSON.stringify(state, null, 2);
}

function downloadState() {
    const jsonState = generateStateJSON();
    const blob = new Blob([jsonState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecovillage-design.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadStateFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const state = JSON.parse(e.target.result);
            rebuildSceneFromState(state);
        } catch (err) {
            console.error("Erro ao carregar o arquivo:", err);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function rebuildSceneFromState(state) {
    clearAllModules();
    projectParams = state.projectParams;
    
    document.getElementById('num-moradores').value = projectParams.numMoradores;
    document.getElementById('num-moradores-value').textContent = projectParams.numMoradores;
    document.getElementById('climate-multiplier').value = projectParams.climateMultiplier;
    
    updateSceneClimate(projectParams.climateMultiplier);

    state.placedModules.forEach(savedModule => {
        const config = MODULE_TYPES[savedModule.name];
        if (config) {
            const pos = new THREE.Vector3().fromArray(savedModule.transform.position);
            const quat = new THREE.Quaternion().fromArray(savedModule.transform.quaternion);
            const scale = new THREE.Vector3().fromArray(savedModule.transform.scale);
            addModule(savedModule.name, config, pos, quat, scale);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    windUniforms.uTime.value += clock.getDelta();
    updateRain();
    orbitControls.update();
    renderer.render(scene, camera);
}

function setupMainMenu() {
    const playBtn = document.getElementById('play-btn');
    const creditsBtn = document.getElementById('credits-btn');
    const closeCreditsBtn = document.getElementById('close-credits-btn');

    const mainMenu = document.getElementById('main-menu');
    const creditsModal = document.getElementById('credits-modal');
    const loadingOverlay = document.getElementById('loading-overlay');
    const appContainer = document.getElementById('app-container');

    playBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex'); 
        
        appContainer.classList.remove('hidden');
        appContainer.classList.add('flex');
        appContainer.style.opacity = '0';

        setTimeout(() => {
            init(); 
        }, 100); 
    });

  
    creditsBtn.addEventListener('click', () => creditsModal.classList.remove('hidden'));
    closeCreditsBtn.addEventListener('click', () => creditsModal.classList.add('hidden'));

    loadingManager.onLoad = () => {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
        appContainer.style.opacity = '1';
    };
    
    loadingManager.onError = (url) => {
        console.error('Erro fatal ao carregar asset:', url);
        loadingOverlay.classList.add('hidden');
        mainMenu.classList.remove('hidden'); 
    };
}

setupMainMenu();