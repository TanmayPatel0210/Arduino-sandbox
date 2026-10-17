const board_div = document.getElementById('board_div');
const board = document.createElement('div');
board.id = 'board';
board_div.appendChild(board);

// --- Camera & Zoom State ---
let currentScale = 0.8; // Defaults to 80% (making the board appear smaller)
let panX = -1350; // Centers the camera on the 4000px canvas
let panY = -1600;
let isPanning = false;
let startPanX, startPanY;

board.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;

// Panning Logic (Click and drag the background)
board_div.addEventListener('mousedown', (e) => {
    if (e.target === board || e.target === board_div) {
        isPanning = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
        board_div.style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', (e) => {
    if (isPanning) {
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        board.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
    }
});

document.addEventListener('mouseup', () => {
    isPanning = false;
    board_div.style.cursor = 'default';
});

// Zoom Controls
document.getElementById('btn-zoom-in').addEventListener('click', () => {
    currentScale = Math.min(currentScale + 0.1, 2.0); // Max zoom 200%
    board.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
    activeWires.forEach(wire => drawWire(wire.pin1, wire.pin2, wire.lane));
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
    currentScale = Math.max(currentScale - 0.1, 0.4); // Min zoom 40%
    board.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
    activeWires.forEach(wire => drawWire(wire.pin1, wire.pin2, wire.lane));
});

// --- Spawn the Snappable Arduino ---
const arduinoDev = document.createElement('div');
arduinoDev.className = 'arduino-device';
arduinoDev.style.left = '1700px'; // Placed perfectly in the center of the 4000px grid
arduinoDev.style.top = '1800px';
board.appendChild(arduinoDev);
drag(arduinoDev);

let globalWireCount = 0;
let selectedWirePath = null;

let activeWires = []; 
let compCount = 0;
let currentContextMenuTarget = null;

const arduinoData = {
    "D0": {title: "Digital Pin 0 (RX)", type: "Serial", descrption: "Used to recieve (RX) serial data. Aviod using for standard components."},
    "D1": {title: "Digital Pin 1 (TX)", type: "Serial", descrption: "Used to transmit (TX) serial data. Aviod using for standard components."},
    "D2": {title: "Digital Pin 2", type: "Interrupt", descrption: "Standard I/O pin. Can triger hardware interrupts to pause code"},
    "D3": {title: "Digital Pin 3 (~)", type: "PWM", descrption: "Standard I/O pin. Supports PWM (Pulse Width Modulation) for fading LEDs."},
    "D4": {title: "Digital Pin 4", type: "I/O", descrption: "Standard I/O pin."},
    "D5": {title: "Digital Pin 5 (~)", type: "PWM", descrption: "Standard I/O pin. Supports PWM"},
    "D6": {title: "Digital Pin 6 (~)", type: "PWM", descrption: "Standard I/O pin. Supports PWM"},
    "D7": {title: "Digital Pin 7", type: "I/O", descrption: "Standard I/O pin."},
    "D8": {title: "Digital Pin 8", type: "I/O", descrption: "Standard I/O pin."},
    "D9": {title: "Digital Pin 9 (~)", type: "PWM", descrption: "Standard I/O pin. Supports PWM"},
    "D10": {title: "Digital Pin 10 (~)", type: "SPI", descrption: "Supports PWM and SPI communication (Slave Select)."},
    "D11": {title: "Digital Pin 11 (~)", type: "SPI", descrption: "Supports PWM and SPI communication (MOSI)."},
    "D12": {title: "Digital Pin 12", type: "SPI", descrption: "Standard I/O. Used for SPI communication(MISO)"},
    "D13": {title: "Digital Pin 13", type: "I/O", descrption: "Standard I/O. Internally connected to the built-in LED."},
    "A0": {title: "Analog Pin A0", type: "Analog", descrption: "Reads varying voltages (0-5V) from analog sensors."},
    "A1": {title: "Analog Pin A1", type: "Analog", descrption: "Reads varying voltages (0-5V) from analog sensors."},
    "A2": {title: "Analog Pin A2", type: "Analog", descrption: "Reads varying voltages (0-5V) from analog sensors."},
    "A3": {title: "Analog Pin A3", type: "Analog", descrption: "Reads varying voltages (0-5V) from analog sensors."},
    "A4": {title: "Analog Pin A4", type: "I2C (SDA)", descrption: "Reads analog data, or acts as the SDL data line for I2C screens."},
    "A5": {title: "Analog Pin A5", type: "I2C (SCL)", descrption: "Reads analog data, or acts as the SCL clock line for I2C screens."},
    "5V": {title: "5V Power", type: "Power", descrption: "Provides a steady 5 Volts to power your bredboard and sensors."},
    "GND": {title: "Ground (GND)", type: "Power", descrption: "Completes the electrical circuit. Connect negative wires here."},
    "3V3": {title: "3.3 Power", type: "Power", descrption: "Provides a smaller 3.3 Volts for smaller, highly sensitive components."},
    "AREF": {title: "Analog Reference", type: "Analog", descrption: "Reference voltage for the analog inputs."},
    "IOREF": {title: "IO Reference", type: "Porwer", descrption: "Provides voltage reference with which the microcontroller operates."},
    "RESET": {title: "RESET", type: "Power", descrption: "Brings this line LOW to reset the microcontroller."},
    "VIN": {title: "Voltage In(VIN)", type: "Power", descrption: "Input voltage for the Arduino board."}
}; 

const pins = [
    {id: 'D0', type: 'digital', x: 548, y: 13},
    {id: 'D1', type: 'digital', x: 528, y: 13},
    {id: 'D2', type: 'digital', x: 509, y: 13},
    {id: 'D3', type: 'digital', x: 489, y: 13},
    {id: 'D4', type: 'digital', x: 469, y: 13},
    {id: 'D5', type: 'digital', x: 449, y: 13},
    {id: 'D6', type: 'digital', x: 430, y: 13},
    {id: 'D7', type: 'digital', x: 410, y: 13},
    {id: 'D8', type: 'digital', x: 376, y: 13},
    {id: 'D9', type: 'digital', x: 356, y: 13},
    {id: 'D10', type: 'digital', x: 337, y: 13},
    {id: 'D11', type: 'digital', x: 317, y: 13},
    {id: 'D12', type: 'digital', x: 297, y: 13},
    {id: 'D13', type: 'digital', x: 277, y: 13},
    {id: 'A0', type: 'analog', x: 448, y: 392},
    {id: 'A1', type: 'analog', x: 468, y: 392},
    {id: 'A2', type: 'analog', x: 488, y: 392},
    {id: 'A3', type: 'analog', x: 508, y: 392},
    {id: 'A4', type: 'analog', x: 528, y: 392},
    {id: 'A5', type: 'analog', x: 548, y: 392},
    {id: '5V', type: 'power', x: 349, y: 392},
    {id: 'GND', type: 'power', x: 257, y: 13},
    {id: 'GND', type: 'power', x: 369, y: 392},
    {id: 'GND', type: 'power', x: 388, y: 392},
    {id: '3V3', type: 'power', x: 329, y: 392},
    {id: 'AREF', type: 'analog', x: 237, y: 13},
    {id: 'IOREF', type: 'power', x: 289, y: 392},
    {id: 'RESET', type: 'power', x: 309, y: 392},
    {id: 'VIN', type: 'power', x: 408, y: 392}
];

let firstClick = null;
let secondClick = null;
let wireMode = false;

const toggle = document.getElementById('toggle');
toggle.addEventListener('click', function() {
    wireMode = !wireMode;
    if (wireMode) {
        toggle.textContent = "Current Mode: WIRE (Click to Change)";
        toggle.classList.add("wireMode");
    }
    else {
        toggle.textContent = "Current Mode: INSPECT (Click to Change)";
        toggle.classList.remove("wireMode");
             
    }
    if (firstClick !== null) {
        firstClick.classList.remove('selected-pin');
        firstClick = null;
    }

    if (!wireMode) {
        monitor.innerHTML = `> System ready. Click a pin to inspect it...`;
    }
    else {
        monitor.innerHTML = `> [SYSTEM]: Wire Mode ENABLED. Click two pins to connect them.`;
    }
});

const monitor = document.getElementById('monitor');

pins.forEach(function(pin){
    const pinEl = document.createElement('div');
    pinEl.className = 'pin ' + pin.type;
    pinEl.id = pin.id;
    pinEl.style.left = pin.x + 'px';
    pinEl.style.top = pin.y + 'px';
    

    pinEl.addEventListener('click', function(){
        let data = arduinoData[pin.id];
        if (wireMode === false){
            monitor.innerHTML = `<span style="color: #ffaa00;">> ${data.title} [${data.type}]</span><br>> ${data.descrption}`;
            if(firstClick !== null) {
                firstClick.classList.remove('selected-pin');
            }
            pinEl.classList.add('selected-pin');
            firstClick = pinEl
        }
        else {
            if (firstClick === null) {
                firstClick = pinEl;
                pinEl.classList.add('selected-pin');
                monitor.innerHTML = `<span style="color: #ffaa00;">> ${data.title} [${data.type}]</span><br>> ${data.descrption}<br><br><span style="color: #00d5ff;">>[SYSTEM]: Waiting for second pin to connect wire...</span>`;
            }
            else {
                if (firstClick !== pinEl) {
                    let check = validate(firstClick, pinEl);
                    if (check.isValid === true){
                        monitor.innerHTML = `<span style="color: #ffaa00;">> ${data.title} [${data.type}]</span><br>> ${data.descrption}<br><br><span style="color: #00ff00;">> [SYSTEM]: Wire successfully routed from ${firstClick.id} to ${pinEl.id}. Click on the wire to select and delete it. </span>`;
                        secondClick = pinEl;
                        drawWire(firstClick, pinEl);
                        activeWires.push({ pin1: firstClick, pin2: pinEl, lane: globalWireCount - 1 }); 
                    }
                    else {
                        monitor.innerHTML = `<span style="color: #ffaa00;">> ${data.title} [${data.type}]</span><br>> ${data.descrption}<br><br><span style="color: #ff0055; font-weight: bold;">> ${check.message}</span>`;
                    }
                }
                else {
                    monitor.innerHTML = `> [SYSTEM]: Wire Mode ENABLED. Click two pins to connect them.`
                }
                firstClick.classList.remove('selected-pin');
                pinEl.classList.remove('selected-pin');
                firstClick = null;
            }
        }
    });
    arduinoDev.appendChild(pinEl);
}); 


function validate (pin1, pin2) {
    let id1 = pin1.id;
    let id2 = pin2.id;
    const power = ['5V', '3V3'];
    const ground = ['GND'];
    if ((power.includes(id1) && ground.includes(id2))||(power.includes(id2) && ground.includes(id1))) {
        return {
            isValid: false,
            message: `[ERROR]: Short Circuit! Connecting ${id1} directly to ${id2} would fry an Arduino board.`
        };
    }
    if (power.includes(id1) && power.includes(id2)) {
        return {
            isValid: false,
            message:`[ERROR]: This would damage the Hardware! You cannot connect ${id1} directly to ${id2}.`
        };
    }
    if (ground.includes(id1) && ground.includes(id2)) {
        return {
            isValid: false,
            message: `[WARNING]: Connecting ${id1} to ${id2} creates a useless loop.`
        };
    }
    return {
        isValid: true,
        message: `[SYSTEM]: Wire successfully routed from ${id1} to ${id2}.`
    };
}

function drawWire(pin1, pin2, existingLane = null) {
    let boardRect = board.getBoundingClientRect();
    let rect1 = pin1.getBoundingClientRect();
    let rect2 = pin2.getBoundingClientRect();
    
    // 1. Get global pin coordinates (Un-scaled for the SVG engine)
    let x1 = ((rect1.left - boardRect.left) / currentScale) + ((rect1.width / currentScale) / 2);
    let y1 = ((rect1.top - boardRect.top) / currentScale) + ((rect1.height / currentScale) / 2);
    let x2 = ((rect2.left - boardRect.left) / currentScale) + ((rect2.width / currentScale) / 2);
    let y2 = ((rect2.top - boardRect.top) / currentScale) + ((rect2.height / currentScale) / 2);
    
    let lane = existingLane !== null ? existingLane : globalWireCount++;

    // 2. Scaled Arduino Bounding Box
    let ard = document.querySelector('.arduino-device');
    let aRect = ard.getBoundingClientRect();
    let aLeft = (aRect.left - boardRect.left) / currentScale;
    let aRight = (aRect.right - boardRect.left) / currentScale;
    let aTop = ((aRect.top - boardRect.top) / currentScale) - 20; 
    let aBot = ((aRect.bottom - boardRect.top) / currentScale) + 20;

    // 3. Determine Exit Directions 
    let dir1 = (pin1.closest('.arduino-device') && parseInt(pin1.style.top) < 200) ? -1 : 1;
    let dir2 = (pin2.closest('.arduino-device') && parseInt(pin2.style.top) < 200) ? -1 : 1;
    
    // Create "Escape Points" that push the wire safely away from the pin before turning.
    // If exiting UP, we route to aTop. If DOWN, we route to aBot.
    let escY1 = (dir1 === -1) ? (aTop - (lane * 8)) : (aBot + (lane * 8));
    let escY2 = (dir2 === -1) ? (aTop - (lane * 8)) : (aBot + (lane * 8));
    
    // Override escape points for components so they don't jump all the way across the screen unnecessarily
    if (!pin1.closest('.arduino-device')) escY1 = y1 + 40 + (lane * 8);
    if (!pin2.closest('.arduino-device')) escY2 = y2 + 40 + (lane * 8);

    // 4. Smart Perimeter Routing (Find a safe vertical channel to route between)
    let vChannelX;
    if (x1 < aLeft && x2 < aLeft) {
        // Both pins are on the left, route around their leftmost point
        vChannelX = Math.min(x1, x2) - 40 - (lane * 8);
    } else if (x1 > aRight && x2 > aRight) {
        // Both pins are on the right, route around their rightmost point
        vChannelX = Math.max(x1, x2) + 40 + (lane * 8);
    } else {
        // Wires cross the board, route around the nearest Arduino edge
        let avgX = (x1 + x2) / 2;
        let aMidX = (aLeft + aRight) / 2;
        vChannelX = (avgX < aMidX) ? (aLeft - 40 - (lane * 8)) : (aRight + 40 + (lane * 8));
    }

    // 5. Construct the Orthogonal Avoidance Path
    let pathString = `M ${x1} ${y1} V ${escY1} H ${vChannelX} V ${escY2} H ${x2} V ${y2}`;

    let existingWire = document.getElementById(`wire-${pin1.id}-${pin2.id}`);
    if (existingWire) {
        existingWire.querySelector('path').setAttribute('d', pathString);
        return;
    }
    
    let container = document.createElement('div');
    container.id = `wire-${pin1.id}-${pin2.id}`;
    container.className = 'wire-group';
    const xmlns = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(xmlns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.overflow = 'visible';
    let path = document.createElementNS(xmlns, "path");
    
    // Dynamic Jumper Wire Colors
    const wireColors = ['#00ff66', '#ff0055', '#00d5ff', '#ffcc00', '#ff00ff', '#ffffff'];
    let wireColor = wireColors[lane % wireColors.length];

    path.setAttribute('d', pathString);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', wireColor);
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    path.style.filter = `drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.8))`;
    path.style.cursor = 'pointer';
    path.style.pointerEvents = 'auto';

    path.addEventListener('click', function(e) {
        e.stopPropagation();
        if (selectedWirePath) {
            selectedWirePath.style.strokeDasharray = 'none'; // Un-select previous
        }
        selectedWirePath = path;
        selectedWirePath.style.strokeDasharray = '10, 10'; // Dashed line = selected
        monitor.innerHTML = `> [SYSTEM]: Wire selected. Press 'Delete' or 'Backspace' to detach.`;
    });

    svg.appendChild(path);
    container.appendChild(svg);
    board.appendChild(container);
}

// Preserved logic: Delete the selected wire
document.addEventListener('keydown', function(e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWirePath) {
        let wireContainer = selectedWirePath.closest('.wire-group');
        let containerId = wireContainer.id;

        wireContainer.remove();
        activeWires = activeWires.filter(wire => `wire-${wire.pin1.id}-${wire.pin2.id}` !== containerId);

        selectedWirePath = null;
        monitor.innerHTML = `> [SYSTEM]: Wire successfully detached and removed. Click two pins to connect them.`;
    }
});

// New logic: Deselect wire when clicking the background
document.addEventListener('click', function(e) {
    if (selectedWirePath) {
        selectedWirePath.style.strokeDasharray = 'none'; // Reset to solid line
        selectedWirePath = null;
        monitor.innerHTML = `>[SYSTEM]: Wire deselected. Click two pins to connect them.`;
    }
});

function drag(element) {
    let isdragging = false;
    let startx, starty, initialleft, initialtop;
    const SNAP_GRID = 20; // Locks everything to 20px intervals

    element.addEventListener('mousedown', function(e){
        if (e.target.classList.contains('pin')) return;
        isdragging = true;
        startx = e.clientX;
        starty = e.clientY;
        initialleft = parseInt(element.style.left) || 0;
        initialtop = parseInt(element.style.top) || 0;
        element.style.zIndex = 100;
        element.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isdragging) return;
        
        // Divide mouse movement by scale so it tracks perfectly with the cursor
        let dx = (e.clientX - startx) / currentScale;
        let dy = (e.clientY - starty) / currentScale;
        
        let newLeft = Math.round((initialleft + dx) / SNAP_GRID) * SNAP_GRID;
        let newTop = Math.round((initialtop + dy) / SNAP_GRID) * SNAP_GRID;

        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        
        // Redraw wires dynamically as objects move
        activeWires.forEach(wire => {
            drawWire(wire.pin1, wire.pin2, wire.lane);
        });
    });
    
    document.addEventListener('mouseup', function() {
        if (isdragging) {
            isdragging = false;
            element.style.zIndex = '5';
            element.style.cursor = 'grab';
        }
    });
}

const addBtn = document.getElementById('add-btn');
const componentDropdown = document.getElementById('component-dropdown');
const contextMenu = document.getElementById('context-menu');

addBtn.addEventListener('click', function() {
    const selectedComponent = componentDropdown.value;

    // 1. LED COMPONENT

    if (selectedComponent === 'led') {
        compCount++;
        let compId = `LED_${compCount}`;

        arduinoData[`${compId}_A`] = { title: `LED Anode (+)` , type: "I/O", descrption: "Connect to power/digital pin." };
        arduinoData[`${compId}_C`] = { title: `LED Cathode (-)` , type: "Ground", descrption: "Connect to GND." };

        let newLed = document.createElement('div');
        newLed.className = 'component led-component led-red'; 
        newLed.id = compId;
        newLed.style.left = '1600px';
        newLed.style.top = '1700px';
        newLed.dataset.type = 'led'; // Used to filter the right-click menu

        let anode = document.createElement('div');
        anode.className = 'pin digital';
        anode.id = `${compId}_A`;
        anode.style.left = '7px';
        anode.style.top = '52px';
        attachPinListener(anode);

        let cathode = document.createElement('div');
        cathode.className = 'pin power';
        cathode.id = `${compId}_C`;
        cathode.style.left = '25px';
        cathode.style.top = '52px';
        attachPinListener(cathode);

        newLed.appendChild(anode);
        newLed.appendChild(cathode);
        board.appendChild(newLed);
        drag(newLed);

        newLed.addEventListener('contextmenu', function(e) { e.preventDefault(); openContextMenu(e, newLed); });
        newLed.addEventListener('dblclick', function() {
            newLed.classList.toggle('is-on');
            let state = newLed.classList.contains('is-on') ? "ON" : "OFF";
            monitor.innerHTML = `> [SYSTEM]: ${compId} is now ${state}.`;
        });
        
        monitor.innerHTML = `> [SYSTEM]: Spawned ${compId}.`;
    }
    
    // 2. PUSH BUTTON COMPONENT

    else if (selectedComponent === 'button') {
        compCount++;
        let compId = `BTN_${compCount}`;

        arduinoData[`${compId}_1`] = { title: `Button Terminal 1`, type: "I/O", descrption: "Digital input/output terminal." };
        arduinoData[`${compId}_2`] = { title: `Button Terminal 2`, type: "I/O", descrption: "Digital input/output terminal." };

        let newBtn = document.createElement('div');
        newBtn.className = 'component button-component';
        newBtn.id = compId;
        newBtn.style.left = '1600px';
        newBtn.style.top = '1800px';
        newBtn.dataset.type = 'button';

        let btnCenter = document.createElement('div');
        btnCenter.className = 'button-center';
        newBtn.appendChild(btnCenter);

        let t1 = document.createElement('div');
        t1.className = 'pin digital';
        t1.id = `${compId}_1`;
        t1.style.left = '-7px';
        t1.style.top = '18px';
        attachPinListener(t1);

        let t2 = document.createElement('div');
        t2.className = 'pin digital';
        t2.id = `${compId}_2`;
        t2.style.left = '43px';
        t2.style.top = '18px';
        attachPinListener(t2);

        newBtn.appendChild(t1);
        newBtn.appendChild(t2);
        board.appendChild(newBtn);
        drag(newBtn);

        // Hardware press logic
        newBtn.addEventListener('mousedown', () => {
            newBtn.classList.add('is-pressed');
            monitor.innerHTML = `> [SYSTEM]: ${compId} is PRESSED.`;
        });
        document.addEventListener('mouseup', () => {
            if (newBtn.classList.contains('is-pressed')) {
                newBtn.classList.remove('is-pressed');
                monitor.innerHTML = `> [SYSTEM]: ${compId} is RELEASED.`;
            }
        });

        newBtn.addEventListener('contextmenu', function(e) { e.preventDefault(); openContextMenu(e, newBtn); });
        monitor.innerHTML = `> [SYSTEM]: Spawned ${compId}. Click and hold to press.`;
    }

    // 3. SERVO MOTOR COMPONENT

    else if (selectedComponent === 'servo') {
        compCount++;
        let compId = `SRV_${compCount}`;

        // Standard 3-wire servo configuration
        arduinoData[`${compId}_GND`] = { title: `Servo GND (Brown)`, type: "Ground", descrption: "Connect to GND." };
        arduinoData[`${compId}_VCC`] = { title: `Servo VCC (Red)`, type: "Power", descrption: "Connect to 5V." };
        arduinoData[`${compId}_PWM`] = { title: `Servo Signal (Orange)`, type: "PWM", descrption: "Connect to a PWM pin (~)." };

        let newServo = document.createElement('div');
        newServo.className = 'component servo-component';
        newServo.id = compId;
        newServo.style.left = '1600px';
        newServo.style.top = '1900px';
        newServo.dataset.type = 'servo';

        let horn = document.createElement('div');
        horn.className = 'servo-horn';
        horn.dataset.angle = '0'; // Custom tracking for rotation state
        
        let hub = document.createElement('div');
        hub.className = 'servo-hub';
        horn.appendChild(hub);
        newServo.appendChild(horn);

        let pGnd = document.createElement('div');
        pGnd.className = 'pin power';
        pGnd.id = `${compId}_GND`;
        pGnd.style.left = '8px'; pGnd.style.top = '33px';
        pGnd.style.backgroundColor = '#5c4033'; // Brown wire
        attachPinListener(pGnd);

        let pVcc = document.createElement('div');
        pVcc.className = 'pin power';
        pVcc.id = `${compId}_VCC`;
        pVcc.style.left = '23px'; pVcc.style.top ='33px';
        pVcc.style.backgroundColor = '#ff0000'; // Red wire
        attachPinListener(pVcc);

        let pPwm = document.createElement('div');
        pPwm.className = 'pin analog';
        pPwm.id = `${compId}_PWM`;
        pPwm.style.left = '38px'; pPwm.style.top = '33px';
        pPwm.style.backgroundColor = '#ff8800'; // Orange wire
        attachPinListener(pPwm);

        newServo.appendChild(pGnd);
        newServo.appendChild(pVcc);
        newServo.appendChild(pPwm);
        board.appendChild(newServo);
        drag(newServo);

        newServo.addEventListener('contextmenu', function(e) { e.preventDefault(); openContextMenu(e, newServo); });
        monitor.innerHTML = `> [SYSTEM]: Spawned ${compId}. Right-click to test rotation.`;
    }
});

// Smart Context Menu Router (Shows/Hides specific options)
function openContextMenu(e, targetComp) {
    currentContextMenuTarget = targetComp;
    let type = targetComp.dataset.type || 'led';
    
    // Hide all unique options first
    document.querySelectorAll('.led-opt, .servo-opt, .hr-opt').forEach(item => item.style.display = 'none');

    // Reveal options based on component type
    if (type === 'led') {
        document.querySelectorAll('.led-opt, .hr-opt').forEach(el => el.style.display = 'block');
    } else if (type === 'servo') {
        document.querySelectorAll('.servo-opt, .hr-opt').forEach(el => el.style.display = 'block');
    }

    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.style.display = 'block';
}

// Global Context Menu Click Handler
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('menu-item') && currentContextMenuTarget) {
        let action = e.target.dataset.action;
        let compId = currentContextMenuTarget.id;

        if (action === 'remove') {
            let wiresToRemove = activeWires.filter(w => w.pin1.id.startsWith(compId) || w.pin2.id.startsWith(compId));
            wiresToRemove.forEach(w => {
                let wireEl = document.getElementById(`wire-${w.pin1.id}-${w.pin2.id}`);
                if (wireEl) wireEl.remove();
            });
            activeWires = activeWires.filter(w => !w.pin1.id.startsWith(compId) && !w.pin2.id.startsWith(compId));
            
            currentContextMenuTarget.remove();
            monitor.innerHTML = `> [SYSTEM]: Removed ${compId} and its connected wires.`;
            
        } else if (action === 'toggle') {
            currentContextMenuTarget.classList.toggle('is-on');
            let state = currentContextMenuTarget.classList.contains('is-on') ? "ON" : "OFF";
            monitor.innerHTML = `> [SYSTEM]: ${compId} is now ${state}.`;
            
        } else if (action === 'rotate-servo') {
            let horn = currentContextMenuTarget.querySelector('.servo-horn');
            let currentRot = parseInt(horn.dataset.angle);
            currentRot = (currentRot + 45) % 180; // Sweeps in 45 degree increments
            horn.dataset.angle = currentRot;
            horn.style.transform = `rotate(${currentRot}deg)`;
            monitor.innerHTML = `> [SYSTEM]: ${compId} rotated to ${currentRot}°.`;

        } else { // LED Color change
            let isOn = currentContextMenuTarget.classList.contains('is-on');
            currentContextMenuTarget.className = `component led-component led-${action} ${isOn ? 'is-on' : ''}`;
            currentContextMenuTarget.dataset.type = 'led'; 
            monitor.innerHTML = `> [SYSTEM]: Changed ${compId} color to ${action}.`;
        }
    }
    contextMenu.style.display = 'none';
});

// Reusable Pin Connection Logic
function attachPinListener(dynamicPin) {
    dynamicPin.addEventListener('click', function() {
        let data = arduinoData[dynamicPin.id];
        
        if (!wireMode) {
            monitor.innerHTML = `<span style="color: #ffaa00;">> ${data.title} [${data.type}]</span><br>> ${data.descrption}`;
            if (firstClick !== null) firstClick.classList.remove('selected-pin');
            dynamicPin.classList.add('selected-pin');
            firstClick = dynamicPin;
        } else {
            if (firstClick === null) {
                firstClick = dynamicPin;
                dynamicPin.classList.add('selected-pin');
                monitor.innerHTML = `<span style="color: #ffaa00;">> ${data.title} [${data.type}]</span><br>> ${data.descrption}<br><br><span style="color: #00d5ff;">>[SYSTEM]: Waiting for second pin...</span>`;
            } else {
                if (firstClick !== dynamicPin) {
                    let check = validate(firstClick, dynamicPin);
                    if (check.isValid) {
                        monitor.innerHTML = `<span style="color: #00ff00;">> [SYSTEM]: Wire successfully routed.</span>`;
                        drawWire(firstClick, dynamicPin);
                        activeWires.push({ pin1: firstClick, pin2: dynamicPin, lane: globalWireCount - 1 });
                    } else {
                        monitor.innerHTML = `<span style="color: #ff0055; font-weight: bold;">> ${check.message}</span>`;
                    }
                }
                firstClick.classList.remove('selected-pin');
                dynamicPin.classList.remove('selected-pin');
                firstClick = null;
            }
        }
    });
}

// ==========================================
// EDITOR: Easy/Advanced Mode Toggle & Setup
// ==========================================
const tabEasy = document.getElementById('tab-easy');
const tabAdv = document.getElementById('tab-adv');
const blocklyDiv = document.getElementById('blocklyDiv');
const codeEditor = document.getElementById('code-editor');

// --- CUSTOM ARDUINO BLOCKS ---
// 1. The Main Setup/Loop Wrapper
Blockly.Blocks['arduino_setup_loop'] = {
    init: function() {
        this.appendDummyInput().appendField("Arduino Program");
        this.appendStatementInput("SETUP").setCheck(null).appendField("Setup (Runs once)");
        this.appendStatementInput("LOOP").setCheck(null).appendField("Loop (Runs forever)");
        this.setColour('#005c5f');
        this.setTooltip("The main structure of your Arduino code.");
        this.setDeletable(false); // Kids can't accidentally delete the main board!
    }
};

// 2. Set Pin to HIGH/LOW
Blockly.Blocks['digital_write'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Set Pin")
            .appendField(new Blockly.FieldDropdown([
                ["13", "13"], ["12", "12"], ["11 (~)", "11"], 
                ["10 (~)", "10"], ["9 (~)", "9"], ["8", "8"], 
                ["7", "7"], ["6 (~)", "6"], ["5 (~)", "5"], 
                ["4", "4"], ["3 (~)", "3"], ["2", "2"]
            ]), "PIN")
            .appendField("to")
            .appendField(new Blockly.FieldDropdown([["HIGH (ON)", "HIGH"], ["LOW (OFF)", "LOW"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#00979D'); // Arduino teal color
        this.setTooltip("Turns a digital pin ON (HIGH) or OFF (LOW).");
    }
};

// 3. Delay (Wait)
Blockly.Blocks['delay_ms'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Wait for")
            .appendField(new Blockly.FieldNumber(1000, 0), "DELAY")
            .appendField("milliseconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#cc7a00'); // Orange for timing blocks
        this.setTooltip("Pauses the code for a specific amount of time.");
    }
};

// 4. Servo Write (Rotate)
Blockly.Blocks['servo_write'] = {
    init: function() {
        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("Rotate Servo on Pin")
            .appendField(new Blockly.FieldDropdown([
                ["11 (~)", "11"], ["10 (~)", "10"], ["9 (~)", "9"], 
                ["6 (~)", "6"], ["5 (~)", "5"], ["3 (~)", "3"]
            ]), "PIN")
            .appendField("to");
        this.appendDummyInput().appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#004488'); // Dark blue to match he physicatl servo
        this.setTooltip("Rotates a servo motor to a specific angle (0-180).");
    }
};

// 5. Digital Read (For Buttons)
Blockly.Blocks['digital_read'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Read Digital Pin")
            .appendField(new Blockly.FieldDropdown([
                ["13", "13"], ["12", "12"], ["11 (~)", "11"], 
                ["10 (~)", "10"], ["9 (~)", "9"], ["8", "8"], 
                ["7", "7"], ["6 (~)", "6"], ["5 (~)", "5"], 
                ["4", "4"], ["3 (~)", "3"], ["2", "2"]
            ]), "PIN");
        this.setOutput(true, ["Number", "Boolean"]);
        this.setColour('#00979D');
        this.setTooltip("Reads the value of a digital pin (Returns HIGH or LOW).");
    }
};

// 6. Serial Print (For debugging/output)
Blockly.Blocks['serial_print'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .appendField("Print to Serial Monitor:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#555555');
        this.setTooltip("Prints text or numbers to the console.");
    }
};


// Inject Google Blockly
let workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    grid: {spacing: 20, length: 3, colour: '#333', snap: true},
    trashcan: true
});

// Automatically place the main Setup/Loop block on the canvas
let defaultBlock = workspace.newBlock('arduino_setup_loop');
defaultBlock.initSvg();
defaultBlock.render();
defaultBlock.moveBy(20, 20); // Push it slightly down and right so it looks neat

// Toggle to Easy Mode
tabEasy.addEventListener('click', () => {
    tabEasy.classList.add('active-tab');
    tabAdv.classList.remove('active-tab');
    blocklyDiv.style.display = 'block';
    codeEditor.style.display = 'none';
    
    Blockly.svgResize(workspace); 
    monitor.innerHTML = `> [SYSTEM]: Switched to EASY MODE (Block Coding).`;
});

// Toggle to Advanced Mode
tabAdv.addEventListener('click', () => {
    tabAdv.classList.add('active-tab');
    tabEasy.classList.remove('active-tab');
    blocklyDiv.style.display = 'none';
    codeEditor.style.display = 'block';
    monitor.innerHTML = `> [SYSTEM]: Switched to ADVANCED MODE (C++ Coding).`;
});