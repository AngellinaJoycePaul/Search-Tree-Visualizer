// ==================== BST IMPLEMENTATION ====================
class Node {
    constructor(value, location = '', isOccupied = 0, vehicleNo = '') {
        this.value = value;
        this.location = location;
        this.isOccupied = isOccupied;
        this.vehicleNo = vehicleNo;
        this.left = null;
        this.right = null;
    }
}

class BST {
    constructor() { this.root = null; }

    insert(value, location, isOccupied, vehicleNo) {
        const newNode = new Node(value, location, isOccupied, vehicleNo);
        if (!this.root) { this.root = newNode; return; }
        let curr = this.root;
        while (true) {
            if (value < curr.value) {
                if (!curr.left) { curr.left = newNode; return; }
                curr = curr.left;
            } else if (value > curr.value) {
                if (!curr.right) { curr.right = newNode; return; }
                curr = curr.right;
            } else return;
        }
    }

    delete(value) { this.root = this._del(this.root, value); }

    _del(root, value) {
        if (!root) return null;
        if (value < root.value) root.left = this._del(root.left, value);
        else if (value > root.value) root.right = this._del(root.right, value);
        else {
            if (!root.left && !root.right) return null;
            if (!root.left) return root.right;
            if (!root.right) return root.left;
            let min = root.right;
            while (min.left) min = min.left;
            root.value = min.value;
            root.location = min.location;
            root.isOccupied = min.isOccupied;
            root.vehicleNo = min.vehicleNo;
            root.right = this._del(root.right, min.value);
        }
        return root;
    }

    getAll(node = this.root, result = []) {
        if (node) {
            result.push(node);
            this.getAll(node.left, result);
            this.getAll(node.right, result);
        }
        return result;
    }

    getDepth(node = this.root) {
        if (!node) return 0;
        return 1 + Math.max(this.getDepth(node.left), this.getDepth(node.right));
    }
}

// ==================== STATE ====================
const bst = new BST();
let traversalSequence = [];
let traversalIndex = -1;
let traversalType = 'preorder';

// Sample data
const sampleData = [
    [50, 'L1-A01', 0, ''],
    [30, 'L1-A02', 1, 'KA01AB1234'],
    [70, 'L2-B01', 0, ''],
    [20, 'L1-A03', 1, 'KA02CD5678'],
    [40, 'L2-B02', 0, ''],
    [60, 'L2-B03', 0, ''],
    [80, 'L3-C01', 1, 'KA03EF9012']
];
sampleData.forEach(d => bst.insert(...d));

// ==================== TAB SWITCHING ====================
document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
        if (tab.dataset.tab === 'reports') updateReports();
        if (tab.dataset.tab === 'spots') renderSpotsTable();
    };
});

// ==================== RENDER TREE ====================
const svg = document.getElementById('treeSvg');
const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 80;
const CANVAS_WIDTH = 1100;

function renderTree(currentValue = null, visitedValues = []) {
    svg.innerHTML = '';
    if (!bst.root) { svg.setAttribute('viewBox', `0 0 ${CANVAS_WIDTH} 480`); return; }

    const positions = {};
    const depth = bst.getDepth();
    const height = Math.max(480, depth * LEVEL_HEIGHT + 80);
    svg.setAttribute('viewBox', `0 0 ${CANVAS_WIDTH} ${height}`);

    function assign(node, level, minX, maxX) {
        if (!node) return;
        const x = (minX + maxX) / 2;
        const y = 60 + level * LEVEL_HEIGHT;
        positions[node.value] = { x, y, node };
        assign(node.left, level + 1, minX, x);
        assign(node.right, level + 1, x, maxX);
    }
    assign(bst.root, 0, 60, CANVAS_WIDTH - 60);

    // Edges
    function drawEdges(node) {
        if (!node) return;
        const p = positions[node.value];
        [['left', node.left], ['right', node.right]].forEach(([side, child]) => {
            if (child) {
                const c = positions[child.value];
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', p.x);
                line.setAttribute('y1', p.y);
                line.setAttribute('x2', c.x);
                line.setAttribute('y2', c.y);
                const active = visitedValues.includes(node.value) && visitedValues.includes(child.value);
                line.setAttribute('class', active ? 'edge edge-active' : 'edge');
                svg.appendChild(line);
                drawEdges(child);
            }
        });
    }
    drawEdges(bst.root);

    // Nodes
    Object.values(positions).forEach(({ x, y, node }) => {
        let cls = 'node-circle';
        if (visitedValues.includes(node.value)) cls += ' node-visited';
        if (currentValue === node.value) cls = 'node-circle node-current';

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', NODE_RADIUS);
        circle.setAttribute('class', cls);
        svg.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('class', 'node-text');
        text.textContent = node.value;
        svg.appendChild(text);
    });
}

// ==================== TRAVERSAL LOGIC ====================
function getTraversal(type) {
    const result = [];
    function inorder(n) { if (n) { inorder(n.left); result.push(n.value); inorder(n.right); } }
    function preorder(n) { if (n) { result.push(n.value); preorder(n.left); preorder(n.right); } }
    function postorder(n) { if (n) { postorder(n.left); postorder(n.right); result.push(n.value); } }
    function levelorder() {
        if (!bst.root) return;
        const q = [bst.root];
        while (q.length) { const n = q.shift(); result.push(n.value); if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
    }
    if (type === 'inorder') inorder(bst.root);
    else if (type === 'preorder') preorder(bst.root);
    else if (type === 'postorder') postorder(bst.root);
    else levelorder();
    return result;
}

const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const progressText = document.getElementById('progressText');
const currentText = document.getElementById('currentText');
const resultBoxes = document.getElementById('resultBoxes');
const traversalSelect = document.getElementById('traversalSelect');

startBtn.onclick = () => {
    traversalType = traversalSelect.value;
    traversalSequence = getTraversal(traversalType);
    traversalIndex = -1;
    resultBoxes.innerHTML = '';
    renderTree();
    progressText.textContent = `Traversal Progress: Ready (${traversalSequence.length} nodes)`;
    currentText.textContent = 'Current Node: —';
    nextBtn.disabled = false;
    startBtn.disabled = true;
};

nextBtn.onclick = () => {
    traversalIndex++;
    if (traversalIndex >= traversalSequence.length) {
        progressText.textContent = `✅ Traversal Complete! (${traversalSequence.length} nodes visited)`;
        currentText.textContent = 'Current Node: —';
        nextBtn.disabled = true;
        startBtn.disabled = false;
        return;
    }

    const current = traversalSequence[traversalIndex];
    const visited = traversalSequence.slice(0, traversalIndex);
    const remaining = traversalSequence.slice(traversalIndex + 1);

    renderTree(current, visited);

    progressText.textContent = `Traversal Progress: Step ${traversalIndex + 1} of ${traversalSequence.length}`;
    currentText.textContent = `Current Node: Spot ${current}`;

    resultBoxes.innerHTML = '';
    traversalSequence.forEach((v, i) => {
        const box = document.createElement('div');
        box.className = 'result-box';
        if (i < traversalIndex) box.classList.add('visited');
        else if (i === traversalIndex) box.classList.add('current');
        box.textContent = v;
        resultBoxes.appendChild(box);
    });
};

resetBtn.onclick = () => {
    traversalIndex = -1;
    traversalSequence = [];
    resultBoxes.innerHTML = '';
    progressText.textContent = 'Traversal Progress: Not started';
    currentText.textContent = 'Current Node: —';
    nextBtn.disabled = true;
    startBtn.disabled = false;
    renderTree();
};

// ==================== PARKING SPOTS TABLE ====================
function renderSpotsTable() {
    const tbody = document.getElementById('spotsTable');
    const nodes = bst.getAll().sort((a, b) => a.value - b.value);
    tbody.innerHTML = '';
    nodes.forEach(n => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${n.value}</strong></td>
            <td>${n.location}</td>
            <td><span class="status-badge ${n.isOccupied ? 'status-occupied' : 'status-available'}">
                ${n.isOccupied ? 'Occupied' : 'Available'}</span></td>
            <td>${n.vehicleNo || '—'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ADD SPOT
const addSpotBtn = document.getElementById('addSpotBtn');
const addForm = document.getElementById('addForm');
addSpotBtn.onclick = () => { addForm.style.display = addForm.style.display === 'none' ? 'flex' : 'none'; };

document.getElementById('cancelSpotBtn').onclick = () => { addForm.style.display = 'none'; };

document.getElementById('saveSpotBtn').onclick = () => {
    const id = parseInt(document.getElementById('newSpotId').value);
    const loc = document.getElementById('newLocation').value || `L?-?`;
    const status = parseInt(document.getElementById('newStatus').value);
    const veh = document.getElementById('newVehicle').value || '';

    if (isNaN(id)) { alert('Enter a valid Spot ID'); return; }

    bst.insert(id, loc, status, veh);
    renderSpotsTable();
    renderTree();
    addForm.style.display = 'none';
    document.getElementById('newSpotId').value = '';
    document.getElementById('newLocation').value = '';
    document.getElementById('newVehicle').value = '';
};

// ==================== REPORTS ====================
function updateReports() {
    const nodes = bst.getAll();
    const total = nodes.length;
    const occupied = nodes.filter(n => n.isOccupied).length;
    const available = total - occupied;
    const rate = total ? Math.round((occupied / total) * 100) : 0;

    document.getElementById('totalSpots').textContent = total;
    document.getElementById('availableSpots').textContent = available;
    document.getElementById('occupiedSpots').textContent = occupied;
    document.getElementById('occupancyRate').textContent = rate + '%';

    const recent = document.getElementById('recentTable');
    recent.innerHTML = '';
    nodes.slice(-5).reverse().forEach(n => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${n.value}</strong></td>
            <td>${n.location}</td>
            <td><span class="status-badge ${n.isOccupied ? 'status-occupied' : 'status-available'}">
                ${n.isOccupied ? 'Occupied' : 'Available'}</span></td>
        `;
        recent.appendChild(tr);
    });
}

document.getElementById('downloadReport').onclick = () => {
    const nodes = bst.getAll().sort((a, b) => a.value - b.value);
    const total = nodes.length;
    const occupied = nodes.filter(n => n.isOccupied).length;
    const available = total - occupied;

    let csv = 'Spot ID,Location,Status,Vehicle\n';
    nodes.forEach(n => {
        csv += `${n.value},${n.location},${n.isOccupied ? 'Occupied' : 'Available'},${n.vehicleNo || '-'}\n`;
    });
    csv += `\nSummary\nTotal,${total}\nAvailable,${available}\nOccupied,${occupied}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parking_report.csv';
    a.click();
};

// ==================== INIT ====================
renderTree();
renderSpotsTable();