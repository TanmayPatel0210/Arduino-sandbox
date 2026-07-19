const board_div = document.getElementById('board_div');

const board = document.createElement('div');
board.id = 'board';

board_div.appendChild(board);

let globalWireCount = 0;

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
}

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
            message: `[WARNING]: Connecting ${id1} to ${id2} creates a useless loop.`
        };
    }

    return {
        isValid: true,
        message: `[SYSTEM]: Wire successfully routed from ${id1} to ${id2}.`
        };
}

function drawWire(pin1, pin2) {
    let x1 = parseInt(pin1.style.left) + 6;     //+6 for getting it at the centre of our 12px pins
    let y1 = parseInt(pin1.style.top) + 6;
    let x2 = parseInt(pin2.style.left) + 6;
    let y2 = parseInt(pin2.style.top) + 6;

    let lane = globalWireCount++;       //isn't it a bit obvious what this does?

    let dir1 = (y1 < 150) ? -1 : 1;   //direction of segment 
    let dir2 = (y2 < 150) ? -1 : 1;    
    
    let drop1 = 20 + (lane * 8);        //creates an gap between each wire
    let drop2 = 20 + (lane * 8);

    let dy1 = y1 + (drop1 * dir1);  // insersts the direction into the drop
    let dy2 = y2 + (drop2 * dir2);

    let midx = (x1 + x2)/2;
    let stagger = (lane %2 === 0) ? (lane * 6) : -(lane * 6);    // if even add 6px ; if odd subtract
    midx += stagger;

    if (Math.abs(x1 - x2) < 10) {
        midx = x1 + 30 + (lane * 10);
    }

    let pathString = `M ${x1} ${y1} V ${dy1} H ${midx} V ${dy2} H ${x2} V ${y2}`;   //Vector instruction (m=move to; v=draw vertically; h= horizontal line)

    let container = document.createElement('div');
    container.id = `wire-${pin1.id}-${pin2.id}`;
    container.className = 'wire-group'

    const xmlns = "http://www.w3.org/2000/svg";     //extra step for simplicity
    let svg = document.createElementNS(xmlns, 'svg');       //creates the svg with namespace same as the http......(as above)
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.overflow = 'visible';

    let path = document.createElementNS(xmlns, 'path');     //element that actually draws the line
    path.setAttribute('d', pathString);      // takes the vector instruction above and puts it in data (d) element 
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#00ff66');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    path.style.filter = 'drop-shadow(0px 0px 4px rgba(0, 255, 102, 0.8))';

    svg.appendChild(path);
    container.appendChild(svg);
    board.appendChild(container);
}  