import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { TransformControls } from 'three/addons/controls/TransformControls.js';

        // --- CONTROLE DO MENU PRINCIPAL ---
        document.addEventListener('DOMContentLoaded', () => {
            const mainMenu = document.getElementById('main-menu');
            const playBtn = document.getElementById('play-btn');
            const optionsBtn = document.getElementById('options-btn');
            const creditsBtn = document.getElementById('credits-btn');
            const optionsModal = document.getElementById('options-modal');
            const creditsModal = document.getElementById('credits-modal');
            const closeOptionsBtn = document.getElementById('close-options-btn');
            const closeCreditsBtn = document.getElementById('close-credits-btn');
            const loadingOverlay = document.getElementById('loading-overlay');
            const appContainer = document.getElementById('app-container');

            // Botão JOGAR - inicia o jogo
            playBtn.addEventListener('click', () => {
                mainMenu.style.transition = 'opacity 0.5s';
                mainMenu.style.opacity = '0';
                setTimeout(() => {
                    mainMenu.classList.add('hidden');
                    loadingOverlay.classList.remove('hidden');
                    loadingOverlay.style.display = 'flex';
                    
                    // Simula carregamento e inicia o jogo
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                        appContainer.classList.remove('hidden');
                        appContainer.style.opacity = '1';
                        init(); // Inicializa o jogo
                    }, 2000);
                }, 500);
            });

            // Botão OPÇÕES - abre modal
            optionsBtn.addEventListener('click', () => {
                optionsModal.classList.remove('hidden');
                optionsModal.classList.add('flex');
            });

            // Botão CRÉDITOS - abre modal
            creditsBtn.addEventListener('click', () => {
                creditsModal.classList.remove('hidden');
                creditsModal.classList.add('flex');
            });

            // Fechar modais
            closeOptionsBtn.addEventListener('click', () => {
                optionsModal.classList.add('hidden');
                optionsModal.classList.remove('flex');
            });

            closeCreditsBtn.addEventListener('click', () => {
                creditsModal.classList.add('hidden');
                creditsModal.classList.remove('flex');
            });

            // Fechar modal ao clicar fora
            optionsModal.addEventListener('click', (e) => {
                if (e.target === optionsModal) {
                    optionsModal.classList.add('hidden');
                    optionsModal.classList.remove('flex');
                }
            });

            creditsModal.addEventListener('click', (e) => {
                if (e.target === creditsModal) {
                    creditsModal.classList.add('hidden');
                    creditsModal.classList.remove('flex');
                }
            });
        });

        // --- DADOS DE CONFIGURAÇÃO ---
        const MODULE_TYPES = {
            'Residência': { 
                color: 0xbe123c, 
                icon: 'home',
                area: 50,
                energyConsumption: 5, // kWh/dia por morador
                waterConsumption: 150, // L/dia por morador
                foodConsumption: 3, // porções/dia por morador
            },
            'Painel Solar': {
                color: 0x0e7490,
                icon: 'sun',
                area: 10,
                energyProduction: 20, // kWh/dia
            },
            'Turbina Eólica': {
                color: 0x9ca3af,
                icon: 'wind',
                area: 5,
                energyProduction: 30, // kWh/dia
            },
            'Coletor de Chuva': {
                color: 0x1d4ed8,
                icon: 'cloud-rain',
                area: 20,
                waterProduction: 500, // L/dia
            },
            'Horta Hidropônica': {
                color: 0x16a34a,
                icon: 'leaf',
                area: 25,
                foodProduction: 30, // porções/dia
                energyConsumption: 10,
                waterConsumption: 50
            },
            'Composteira': {
                color: 0x7c2d12,
                icon: 'recycle',
                area: 6,
                description: 'Processa resíduos orgânicos.'
            },
            'Biodigestor': {
                color: 0x4a044e,
                icon: 'flame',
                area: 15,
                energyProduction: 15, // Biogás em kWh/dia
                description: 'Converte lixo em biogás.'
            },
        };

        const MODULE_ICONS = {
            'home': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
            'sun': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
            'wind': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 6.6a9 9 0 00-14.8 0" /><path stroke-linecap="round" stroke-linejoin="round" d="M4.6 17.4a9 9 0 0014.8 0" /></svg>`,
            'cloud-rain': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 19v2m-3-3v2m6-2v2" /></svg>`,
            'leaf': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
            'recycle': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>`,
            'flame': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 2a8.003 8.003 0 016.014 2.986C20.5 5 21 8 21 10c2 1 2.657 1.343 2.657 2.657a8 8 0 01-1.343 5.657z" /></svg>`,
            'default': `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>`
        };

        const CHECKLIST_ITEMS = ['Balanço Energético Positivo', 'Autossuficiência Hídrica', 'Produção de Alimentos Suficiente'];
        const INITIAL_CAMERA_POS = new THREE.Vector3(30, 30, 40);

        // --- Componentes Core do Three.js ---
        let scene, renderer, orbitControls, transformControls, raycaster;
        let camera, groundPlane, environmentGroup;
        const pointer = new THREE.Vector2();
        const placedModules = [];

        // --- Elementos DOM ---
        const canvasContainer = document.getElementById('canvas-container');
        // ... (elementos para o dashboard de recursos)
        const energyBalanceEl = document.getElementById('energy-balance');
        const waterBalanceEl = document.getElementById('water-balance');
        const foodBalanceEl = document.getElementById('food-balance');
        const energyBar = document.getElementById('energy-bar');
        const waterBar = document.getElementById('water-bar');
        const foodBar = document.getElementById('food-bar');
        const alertsListEl = document.getElementById('alerts-list');
        const checklistListEl = document.getElementById('checklist-list');
        const selectedModuleInfoEl = document.getElementById('selected-module-info');
        const selectedModuleNameEl = document.getElementById('selected-module-name');
        const selectedModuleDetailsEl = document.getElementById('selected-module-details');

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
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87ceeb); // Sky blue
            scene.fog = new THREE.Fog(0x87ceeb, 100, 300);

            camera = new THREE.PerspectiveCamera(60, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
            camera.position.copy(INITIAL_CAMERA_POS);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            canvasContainer.appendChild(renderer.domElement);

            raycaster = new THREE.Raycaster();

            setupLights();
            setupControls();
            loadAssets();
            setupUI();
            
            runAnalysis();
            animate();

            // Event Listeners
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('keydown', onKeyDown);
            canvasContainer.addEventListener('pointerdown', onCanvasClick);
            canvasContainer.addEventListener('dragover', (e) => e.preventDefault());
            canvasContainer.addEventListener('drop', onDrop);
        }

        function setupLights() {
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(-30, 50, 20);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.left = -100;
            directionalLight.shadow.camera.right = 100;
            directionalLight.shadow.camera.top = 100;
            directionalLight.shadow.camera.bottom = -100;
            scene.add(directionalLight);
        }

        function setupControls() {
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;

            transformControls = new TransformControls(camera, renderer.domElement);
            scene.add(transformControls);
            transformControls.addEventListener('dragging-changed', event => { 
                orbitControls.enabled = !event.value; 
                if (!event.value) snapToGrid(transformControls.object);
            });
            transformControls.addEventListener('objectChange', () => runAnalysis());
        }

        function loadAssets() {
            const textureLoader = new THREE.TextureLoader();
            const groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg', (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(50, 50);
            });

            const groundMat = new THREE.MeshLambertMaterial({ map: groundTexture });
            const groundGeo = new THREE.PlaneGeometry(500, 500);
            groundPlane = new THREE.Mesh(groundGeo, groundMat);
            groundPlane.rotation.x = -Math.PI / 2;
            groundPlane.receiveShadow = true;
            groundPlane.userData.isGround = true;
            scene.add(groundPlane);

            createEnvironmentFeatures();
        }

        function createEnvironmentFeatures() {
            environmentGroup = new THREE.Group();
            const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const treeLeavesMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
            const leavesGeo = new THREE.IcosahedronGeometry(3, 0);

            for (let i = 0; i < 30; i++) {
                const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
                const leaves = new THREE.Mesh(leavesGeo, treeLeavesMat);
                const tree = new THREE.Group();
                trunk.position.y = 2;
                leaves.position.y = 6;
                tree.add(trunk, leaves);
                
                const angle = Math.random() * Math.PI * 2;
                const radius = 50 + Math.random() * 80;
                tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                
                const scale = 0.8 + Math.random() * 0.4;
                tree.scale.set(scale, scale, scale);

                environmentGroup.add(tree);
            }
            scene.add(environmentGroup);
        }

        // --- Manipulação de Eventos ---
        function onWindowResize() {
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        }

        function onKeyDown(event) {
            switch(event.key.toLowerCase()) {
                case 'w': transformControls.setMode('translate'); break;
                case 'e': transformControls.setMode('rotate'); break;
                case 's': transformControls.setMode('scale'); break;
                case 'q': case 'delete': deleteSelectedObject(); break;
                case 'escape': deselectObject(); break;
            }
        }
        
        function onCanvasClick(event) {
            if (transformControls.dragging) return;
            
            pointer.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
            pointer.y = - (event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);

            const intersects = raycaster.intersectObjects(placedModules);
            if (intersects.length > 0) {
                selectObject(intersects[0].object);
            } else {
                deselectObject();
            }
        }

        function onDrop(event) {
            event.preventDefault();
            const moduleName = event.dataTransfer.getData("text/plain");
            const config = MODULE_TYPES[moduleName];
            if (!config) return;

            pointer.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
            pointer.y = - (event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);

            const intersects = raycaster.intersectObject(groundPlane);
            if (intersects.length > 0) {
                addModule(moduleName, config, intersects[0].point);
            }
        }

        // --- UI ---
        function setupUI() {
            document.getElementById('reset-camera-btn').addEventListener('click', () => {
                orbitControls.reset();
                camera.position.copy(INITIAL_CAMERA_POS);
            });
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
                projectParams.climateMultiplier = parseFloat(e.target.value);
                runAnalysis();
            });

            // Gerenciamento
            document.getElementById('save-btn').addEventListener('click', saveState);
            document.getElementById('download-btn').addEventListener('click', downloadState);
            const loadInput = document.getElementById('load-input');
            document.getElementById('load-btn').addEventListener('click', () => loadInput.click());
            loadInput.addEventListener('change', loadStateFromFile);

            const modulePalette = document.getElementById('module-palette');
            Object.entries(MODULE_TYPES).forEach(([name, config]) => {
                const button = document.createElement('div');
                button.draggable = true;
                button.dataset.moduleName = name;
                button.className = 'module-button flex flex-col items-center justify-center p-2 bg-gray-700 rounded-lg text-xs font-medium text-gray-200 transition-all duration-200 transform hover:scale-105 hover:shadow-lg border-2 border-transparent cursor-grab';
                const hexColor = `#${new THREE.Color(config.color).getHexString()}`;
                button.style.setProperty('--module-color', hexColor);
                button.onmouseenter = () => button.style.borderColor = button.style.getPropertyValue('--module-color');
                button.onmouseleave = () => button.style.borderColor = 'transparent';
                button.innerHTML = `${MODULE_ICONS[config.icon] || MODULE_ICONS['default']}<span>${name}</span>`;
                button.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData("text/plain", name);
                    event.dataTransfer.effectAllowed = "copy";
                });
                modulePalette.appendChild(button);
            });

            populateChecklist();
        }

        // --- LÓGICA PRINCIPAL ---
        function addModule(name, config, position, rotation, scale) {
            const geometry = new THREE.BoxGeometry(4, 4, 4);
            const material = new THREE.MeshLambertMaterial({ color: config.color });
            const module = new THREE.Mesh(geometry, material);
            
            position.y += 2; // Place on top of the ground
            module.position.copy(position);
            
            if (rotation) module.quaternion.copy(rotation);
            if (scale) module.scale.copy(scale);

            module.castShadow = true;
            module.receiveShadow = true;
            module.userData = { name, config };
            
            scene.add(module);
            placedModules.push(module);
            snapToGrid(module);
            selectObject(module);
            runAnalysis();
        }
        
        function clearAllModules() {
            deselectObject();
            [...placedModules].forEach(module => {
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
            // Prevent modules from going under the ground
            const box = new THREE.Box3().setFromObject(object);
            const height = box.max.y - box.min.y;
            object.position.y = height / 2;
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
        }

        function deleteSelectedObject() {
            const selected = transformControls.object;
            if (!selected) return;
            const index = placedModules.indexOf(selected);
            if (index > -1) placedModules.splice(index, 1);
            scene.remove(selected);
            deselectObject();
            runAnalysis();
        }

        // --- Análise e Simulação ---
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

            if (energyBalance < 0) alerts.add(`Déficit de energia: ${energyBalance.toFixed(0)} kWh/dia. Adicione mais módulos de produção.`);
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
                    percentage = (production / (production - balance)) * 100;
                }
                percentage = Math.max(0, Math.min(100, percentage));
                barEl.style.width = `${percentage}%`;
                barEl.classList.toggle('bg-red-500', balance < 0);
                barEl.classList.toggle('bg-yellow-400', balance >= 0 && barEl.id === 'energy-bar');
                 barEl.classList.toggle('bg-blue-400', balance >= 0 && barEl.id === 'water-bar');
                 barEl.classList.toggle('bg-green-400', balance >= 0 && barEl.id === 'food-bar');
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
                li.innerHTML = `<span class="mr-2">&#10008;</span> ${name}`;
                li.className = 'text-red-400';
                checklistListEl.appendChild(li);
            });
        }
        
        function updateChecklistUI(balances) {
            const check = (name, condition) => {
                const li = document.getElementById(`checklist-${name.replace(/\s+/g, '-')}`);
                if (li) {
                    li.className = condition ? 'text-green-400' : 'text-red-400';
                    li.querySelector('span').innerHTML = condition ? '&#10004;' : '&#10008;';
                }
            };
            check(CHECKLIST_ITEMS[0], balances.energyBalance >= 0);
            check(CHECKLIST_ITEMS[1], balances.waterBalance >= 0);
            check(CHECKLIST_ITEMS[2], balances.foodBalance >= 0);
        }

        function updateAlertsUI(alerts) {
            alertsListEl.innerHTML = alerts.size === 0 
                ? '<li class="text-gray-500">Nenhum alerta no momento.</li>'
                : [...alerts].map(alert => `<li class="text-yellow-400">${alert}</li>`).join('');
        }
        
        function updateSelectedModuleInfo(module) {
            const { name, config } = module.userData;
            selectedModuleNameEl.textContent = name;
            let detailsHtml = '';
            if (config.energyProduction) detailsHtml += `<p>⚡ Produção de Energia: <span class="font-mono">${(config.energyProduction * projectParams.climateMultiplier).toFixed(0)} kWh/dia</span></p>`;
            if (config.energyConsumption) detailsHtml += `<p>⚡ Consumo de Energia: <span class="font-mono">${config.energyConsumption} kWh/dia</span></p>`;
            if (config.waterProduction) detailsHtml += `<p>💧 Produção de Água: <span class="font-mono">${(config.waterProduction * projectParams.climateMultiplier).toFixed(0)} L/dia</span></p>`;
            if (config.waterConsumption) detailsHtml += `<p>💧 Consumo de Água: <span class="font-mono">${config.waterConsumption} L/dia</span></p>`;
            if (config.foodProduction) detailsHtml += `<p>🥕 Produção de Alimentos: <span class="font-mono">${config.foodProduction} porções/dia</span></p>`;
            if (config.description) detailsHtml += `<p class="text-gray-400">${config.description}</p>`;
            selectedModuleDetailsEl.innerHTML = detailsHtml;
        }

        // --- Salvar e Carregar ---
        function saveState() {
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
            const jsonState = JSON.stringify(state, null, 2);
            localStorage.setItem('reEarthDesignerState', jsonState);
            console.log("Estado salvo no localStorage.");
            return jsonState;
        }

        function downloadState() {
            const jsonState = saveState();
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
                    alert("Erro: Não foi possível carregar o arquivo de design.");
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        function rebuildSceneFromState(state) {
            clearAllModules();
            projectParams = state.projectParams;
            
            // Atualiza a UI com os parâmetros carregados
            document.getElementById('num-moradores').value = projectParams.numMoradores;
            document.getElementById('num-moradores-value').textContent = projectParams.numMoradores;
            document.getElementById('climate-multiplier').value = projectParams.climateMultiplier;

            state.placedModules.forEach(savedModule => {
                const config = MODULE_TYPES[savedModule.name];
                if (config) {
                    const pos = new THREE.Vector3().fromArray(savedModule.transform.position);
                    const quat = new THREE.Quaternion().fromArray(savedModule.transform.quaternion);
                    const scale = new THREE.Vector3().fromArray(savedModule.transform.scale);
                    addModule(savedModule.name, config, pos, quat, scale);
                }
            });
            runAnalysis();
        }

        // --- Loop de Animação ---
        function animate() {
            requestAnimationFrame(animate);
            orbitControls.update();
            renderer.render(scene, camera);
        }

        // A aplicação será iniciada quando o botão JOGAR for clicado

