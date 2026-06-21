const board_div = document.getElementById('board_div');

const board = document.createElement('div');
board.id = 'board';
board_div.appendChild(board);

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
}

const pins = [
    {id: 'D0', type: 'digital', x: 28, y: 12},
    {id: 'D1', type: 'digital', x: 68, y: 12},
    {id: 'D2', type: 'digital', x: 108, y: 12},
    {id: 'D3', type: 'digital', x: 148, y: 12},
    {id: 'D4', type: 'digital', x: 188, y: 12},
    {id: 'D5', type: 'digital', x: 228, y: 12},
    {id: 'D6', type: 'digital', x: 268, y: 12},
    {id: 'D7', type: 'digital', x: 308, y: 12},
    {id: 'D8', type: 'digital', x: 348, y: 12},
    {id: 'D9', type: 'digital', x: 388, y: 12},
    {id: 'D10', type: 'digital', x: 428, y: 12},
    {id: 'D11', type: 'digital', x: 468, y: 12},
    {id: 'D12', type: 'digital', x: 508, y: 12},
    {id: 'D13', type: 'digital', x: 548, y: 12},
    {id: 'A0', type: 'analog', x: 28, y: 314},
    {id: 'A1', type: 'analog', x: 68, y: 314},
    {id: 'A2', type: 'analog', x: 108, y: 314},
    {id: 'A3', type: 'analog', x: 148, y: 314},
    {id: 'A4', type: 'analog', x: 188, y: 314},
    {id: 'A5', type: 'analog', x: 228, y: 314},
    {id: '5V', type: 'power', x: 468, y: 314},
    {id: 'GND', type: 'power', x: 508, y: 314},
    {id: '3V3', type: 'power', x: 548, y: 314}
]

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
    pinEl.textContent = pin.id;

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
                        monitor.innerHTML = `<span style="color: #ffaa00;">> ${data.title} [${data.type}]</span><br>> ${data.descrption}<br><br><span style="color: #00ff00;">> [SYSTEM]: Wire successfully routed from ${firstClick.id} to ${pinEl.id}. Click on ${firstClick.id} again to detach the wire. </span>`;
                        secondClick = pinEl;
                        drawWire(firstClick, pinEl);
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
            message: '[WARNING]: Connecting ${id1} to ${id2} creates a useless loop.'
        };
    }

    return {
        isValid: true,
        message: `[SYSTEM]: Wire successfully routed from ${id1} to ${id2}.`
        };
}

function drawWire(pin1, pin2) {
    let x1 = parseInt(pin1.style.left) + 12;
    let y1 = parseInt(pin1.style.top) +12;
    let x2 = parseInt(pin2.style.left) + 12;
    let y2 = parseInt(pin2.style.top) + 12;

    let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    let angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    let wire = document.createElement('div');
    wire.className = 'wire';
    wire.style.width = distance + 'px';
    wire.style.left = x1 + 'px';
    wire.style.top = y1 + 'px';
    wire.style.transform = `rotate(${angle}deg)`;

    board.appendChild(wire);
}