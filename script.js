const board_div = document.getElementById('board_div');
const board = document.createElement('div');
board.id = 'board';
board_div.appendChild(board);

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
                        activeWires.push({ pin1: firstClick, pin2: pinEl, lane: globalWireCount - 1 }); // Pluralized to match tracker
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
    board.appendChild(pinEl);
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
    let x1 = (rect1.left -boardRect.left) + (rect1.width / 2);
    let y1 = (rect1.top - boardRect.top) + (rect1.height / 2);
    let x2 = (rect2.left - boardRect.left) + (rect2.width / 2);
    let y2 = (rect2.top - boardRect.top) + (rect2.height / 2);
    let lane = existingLane !== null ? existingLane : globalWireCount++;
         
    let dir1 = (y1 < 150) ? -1 : 1; 
    let dir2 = (y2 < 150) ? -1 : 1; 
         
    let drop1 = 20 + (lane * 8);
    let drop2 = 20 + (lane * 8);
    let dy1 = y1 + (drop1 * dir1);
    let dy2 = y2 + (drop2 * dir2);
    let midx = (x1 + x2)/2;
    let stagger = (lane %2 === 0) ? (lane * 6) : -(lane * 6);
    midx += stagger;
    if(Math.abs(x1 - x2) < 10) {
        midx = x1 + 30 + (lane * 10);
    }
    let pathString = `M ${x1} ${y1} V ${dy1} H ${midx} V ${dy2} H ${x2} V ${y2}`; 

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
    path.setAttribute('d', pathString);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#00ff66');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    path.style.filter = 'drop-shadow(0px 0px 4px rgba(0, 255, 102, 0.8))';
    path.style.cursor = 'pointer';
    path.style.pointerEvents = 'auto';

    path.addEventListener('click', function(e) {
        e.stopPropagation();

        if (selectedWirePath) {
            selectedWirePath.style.stroke = '#00ff66';
        }

        selectedWirePath = path;
        selectedWirePath.style.stroke = '#ff0055';

        monitor.innerHTML = `> [SYSTEM]: Wire selected. Press 'Delete' or 'Backspace' to detach.`;
    });

    svg.appendChild(path);
    container.appendChild(svg);
    board.appendChild(container);
} 

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

document.addEventListener('click', function(e) {
    if (selectedWirePath) {
        selectedWirePath.style.stroke = '#00ff55';
        selectedWirePath = null;
        monitor.innerHTML = `>[SYSTEM]: Wire deselected. Click two pins to connect them.`;
    }
});



function drag(element) {
    let isdragging = false;
    let startx, starty, initialleft, initialtop;
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
        let dx = e.clientX - startx;
        let dy = e.clientY - starty;
        element.style.left = (initialleft + dx) + 'px';
        element.style.top = (initialtop + dy) + 'px';
        activeWires.forEach(wire => {
            drawWire(wire.pin1, wire.pin2, wire.lane);
        });
    });
    
    document.addEventListener('mouseup', function() {
        if (isdragging) {
            isdragging = false
            element.style.zIndex = '';
            element.style.cursor = 'grab';
        }
    });
}

const addBtn = document.getElementById('add-btn');
const componentDropdown = document.getElementById('component-dropdown');
const contextMenu = document.getElementById('context-menu');

addBtn.addEventListener('click', function() {
    const selectedComponent = componentDropdown.value;

    if (selectedComponent === 'led') {
        compCount++;
        let compId = `LED_${compCount}`;

        // Register pins for the monitor
        arduinoData[`${compId}_A`] = { title: `LED Anode (+)` , type: "I/O", descrption: "Connect to power/digital pin." };
        arduinoData[`${compId}_C`] = { title: `LED Cathode (-)` , type: "Ground", descrption: "Connect to GND." };

        let newLed = document.createElement('div');
        newLed.className = 'component led-component led-red'; // Defaults to red
        newLed.id = compId;
        newLed.style.left = '50px';
        newLed.style.top = '50px';

        // Anode Pin (+)
        let anode = document.createElement('div');
        anode.className = 'pin digital';
        anode.id = `${compId}_A`;
        anode.style.left = '10px';
        anode.style.top = '23px';
        attachPinListener(anode);

        // Cathode Pin (-)
        let cathode = document.createElement('div');
        cathode.className = 'pin power';
        cathode.id = `${compId}_C`;
        cathode.style.left = '36px';
        cathode.style.top = '23px';
        attachPinListener(cathode);

        newLed.appendChild(anode);
        newLed.appendChild(cathode);
        board.appendChild(newLed);
        drag(newLed);

        // Right-Click to open menu
        newLed.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            currentContextMenuTarget = newLed;
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.style.display = 'block';
        });
        // NEW: Double-click to quickly toggle power
        newLed.addEventListener('dblclick', function() {
            newLed.classList.toggle('is-on');
            let state = newLed.classList.contains('is-on') ? "ON" : "OFF";
            monitor.innerHTML = `> [SYSTEM]: ${compId} is now ${state}.`;
        });
        
        monitor.innerHTML = `> [SYSTEM]: Spawned ${compId}. Right-click it to change color or remove.`;
    }
});

// Handle Context Menu Actions (Color change & Removal)
// Handle Context Menu Actions (Color change, Toggle, & Removal)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('menu-item') && currentContextMenuTarget) {
        let action = e.target.dataset.action;
        let compId = currentContextMenuTarget.id;

        if (action === 'remove') {
            // Find and delete all wires connected to this component
            let wiresToRemove = activeWires.filter(w => w.pin1.id.startsWith(compId) || w.pin2.id.startsWith(compId));
            wiresToRemove.forEach(w => {
                let wireEl = document.getElementById(`wire-${w.pin1.id}-${w.pin2.id}`);
                if (wireEl) wireEl.remove();
            });
            activeWires = activeWires.filter(w => !w.pin1.id.startsWith(compId) && !w.pin2.id.startsWith(compId));
            
            currentContextMenuTarget.remove();
            monitor.innerHTML = `> [SYSTEM]: Removed ${compId} and its connected wires.`;
            
        } else if (action === 'toggle') {
            // Turn LED on or off
            currentContextMenuTarget.classList.toggle('is-on');
            let state = currentContextMenuTarget.classList.contains('is-on') ? "ON" : "OFF";
            monitor.innerHTML = `> [SYSTEM]: ${compId} is now ${state}.`;
            
        } else {
            // Change color class, but preserve the ON/OFF state!
            let isOn = currentContextMenuTarget.classList.contains('is-on');
            currentContextMenuTarget.className = `component led-component led-${action} ${isOn ? 'is-on' : ''}`;
            monitor.innerHTML = `> [SYSTEM]: Changed ${compId} color to ${action}.`;
        }
    }
    // Hide menu after clicking anywhere
    contextMenu.style.display = 'none';
});

// Reusable function for new component pins
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