const board_div = document.getElementById('board_div');

const board = document.createElement('div');
board.id = 'board';
board_div.appendChild(board);

const pins = [
    {id: 'D0', type: 'digital', x: 60, y: 10},
    {id: 'D1', type: 'digital', x: 100, y: 10},
    {id: 'D2', type: 'digital', x: 140, y: 10},
    {id: 'D3', type: 'digital', x: 180, y: 10},
    {id: 'D4', type: 'digital', x: 220, y: 10},
    {id: 'D5', type: 'digital', x: 260, y: 10},
    {id: 'D6', type: 'digital', x: 300, y: 10},
    {id: 'D7', type: 'digital', x: 340, y: 10},
    {id: 'D8', type: 'digital', x: 380, y: 10},
    {id: 'D9', type: 'digital', x: 420, y: 10},
    {id: 'D10', type: 'digital', x: 460, y: 10},
    {id: 'D11', type: 'digital', x: 500, y: 10},
    {id: 'D12', type: 'digital', x: 540, y: 10},
    {id: 'D13', type: 'digital', x: 580, y: 10},
    {id: 'A0', type: 'analog', x: 60, y: 310},
    {id: 'A1', type: 'analog', x: 100, y: 310},
    {id: 'A2', type: 'analog', x: 140, y: 310},
    {id: 'A3', type: 'analog', x: 180, y: 310},
    {id: 'A4', type: 'analog', x: 220, y: 310},
    {id: 'A5', type: 'analog', x: 260, y: 310},
    {id: '5V', type: 'power', x: 360, y: 310},
    {id: 'GND', type: 'power', x: 400, y: 310},
    {id: '3V3', type: 'power', x: 440, y: 310},
]

pins.forEach(function(pin){
    const pinEl = document.createElement('div');
    pinEl.className = 'pin ' + pin.type;
    pinEl.id = pin.id;
    pinEl.style.left = pin.x + 'px';
    pinEl.style.top = pin.y + 'px';

    board.appendChild(pinEl);
});