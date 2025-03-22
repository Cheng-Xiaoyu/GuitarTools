



const strings = ['E', 'B', 'G', 'D', 'A', 'E']; // 从高音到低音弦
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CGegrees = [0, 2, 4, 5, 7, 9, 11];
// C大调音阶参数
const CMajor = {
    scaleDegrees: [0, 2, 4, 5, 7, 9, 11], // MIDI音阶数值(C4=60)
    noteNames: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
};

let currentNote = null, currentPos = null, showNotes = true;
// 吉他标准调弦各弦空弦音高 (从6弦到1弦)
const stringTunings = [
    { baseNote: 'E', octave: 4 }, // 1弦
    { baseNote: 'B', octave: 3 }, // 2弦
    { baseNote: 'G', octave: 3 }, // 3弦
    { baseNote: 'D', octave: 3 }, // 4弦
    { baseNote: 'A', octave: 2 }, // 5弦
    { baseNote: 'E', octave: 2 }  // 6弦
];

// 修改后的指板初始化函数
function initFretboard() {
    const fb = document.getElementById('fretboard');

    // 创建琴弦
    for (let i = 0; i < 6; i++) {
        const string = document.createElement('div');
        string.className ='string';
        string.style.top = `${i * 50 + 25}px`;
        fb.appendChild(string);
    }

    // 创建品柱与标记
    for (let f = 0; f <= 12; f++) {
        // 品柱
        const fret = document.createElement('div');
        fret.className = 'fret' + (f === 0? ' nut' : '');
        fret.style.left = `${f * 60 + 30}px`;
        fret.style.width = '6px';

        // 设置琴枕特殊样式
        if (f === 0) {
            fret.style.width = '20px';
            fret.style.backgroundColor = '#f8e6d9';
            fret.style.borderRadius = '5px 5px 5px 5px';
        }

        fb.appendChild(fret);

        // 指板标记生成
        [3, 5, 7, 9, 12].forEach(f => {
            const mark = document.createElement('div');
            mark.className = 'fret-mark';
            mark.dataset.fret = f; // 添加数据属性

            // 计算品格中心位置：前一个品的右侧位置 + 半个品格宽度
            mark.style.left = `${(f - 0.5) * 60 + 30}px`; // 修正定位公式

            // 垂直居中调整 (根据实际指板高度)
            const boardHeight = 300; // 假设指板总高度
            mark.style.top = `${boardHeight / 2 - 6}px`; // 6px是标记半径
            mark.style.zIndex = 2;

            // 双标记处理
            if (f === 12) {
                const mark2 = mark.cloneNode();
                mark2.style.top = `${boardHeight / 2 + 46}px`; // 下方标记
                mark.style.top = `${boardHeight / 2 - 46}px`;
                fb.appendChild(mark2);
            }
            fb.appendChild(mark);
        });
    }
}

initFretboard();


// 品格中心计算函数
function calculateFretCenter(fretNum) {
    if (fretNum === 0) return 0; // 空弦特殊处理
    const fretPosition = (fretNum - 1) * 60 + 34;
    const fretWidth=60;
    return fretPosition + fretWidth / 2;
}





// 生成题目-原始版
function generateQuestion() {
    // 移除旧目标
    document.querySelectorAll('.note-label').forEach(el => el.remove());

    const RandomNote = getRandomNote();
    addNoteLabel(RandomNote, false);
    currentNote = RandomNote.noteName;
}

// 生成C大调内音的随机题目
function getRandomNote() {
    // 获取所有符合条件的音品位置
    // const maxFret = parseInt(document.getElementById('fretRange').value);
    const positions = getAllScalePositions();
    const filterPos = positions.filter(pos =>
        pos.fretNum >= fretStart && pos.fretNum <= fretEnd &&
        pos.stringNum >=strStart && pos.stringNum <= strEnd
    );
    const randomIndex = Math.floor(Math.random() * filterPos.length);
    const target = filterPos[randomIndex];

    return target;
}

// 获取所有C大调音阶位置
function getAllScalePositions() {
    const positions = [];
    // 遍历6根琴弦
    for (let stringNum = 1; stringNum <= 6; stringNum++) {
        // 遍历前12品 (包含空弦)
        for (let fretNum = 0; fretNum <= 12; fretNum++) {
            const note = getNoteInfo(stringNum, fretNum);

            if (CMajor.noteNames.includes(note.name)) {
                positions.push({
                    stringNum: stringNum,
                    fretNum: fretNum,
                    noteName: note.name
                });
            }
        }
    }
    return positions;
}

// 获取指定位置音高信息
function getNoteInfo(stringNum, fret) {
    const stringIndex = stringNum - 1; // 转换为数组索引
    const tuning = stringTunings[stringIndex];
    // 计算MIDI音高值
    const midiNote = noteToMidi(tuning.baseNote, tuning.octave) + fret;
    // 转换为音名
    const noteName = midiToNote(midiNote);
    return {
        midiNote: midiNote,
        name: noteName.replace(/\d/g, '') // 去除八度数字
    };
}

// MIDI转换工具函数
function noteToMidi(note, octave) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(note.replace(/#/g, '♯'));
    return 12 + (octave * 12) + index;
}

function midiToNote(midi) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return notes[noteIndex] + octave;
}

// 初始化时显示所有调内音位置
function highlightScalePositions() {
    const positions = getAllScalePositions();
    positions.forEach(pos => {
        const marker = document.createElement('div');
        marker.className = 'fret-scale-marker';
        marker.style.top = `${(pos.stringNum - 0.5) * 50}px`;
        marker.style.left = calculateFretCenter(pos.fretNum);
        fretboard.appendChild(marker);
    });
}

// 显示C大调音名的函数
function showScaleNotes() {
    // 先清除已有标签
    document.querySelectorAll('.note-label').forEach(el => el.remove());

    // 获取所有C大调音阶位置
    const positions = getAllScalePositions();

    positions.forEach(pos => {
        addNoteLabel(pos, true)
    });
}

function addNoteLabel(pos, hastext) {
    // 创建音名标签
    const label = document.createElement('div');
    label.className = 'note-label';
    if (hastext) {
        label.textContent = pos.noteName;
    } else {
        label.textContent = '?';
    }

    // 定位计算 (复用之前的逻辑)
    const stringPos = (pos.stringNum - 0.5) * 50;
    const fretCenter = calculateFretCenter(pos.fretNum);

    label.style.top = `${stringPos}px`;
    label.style.left = `${fretCenter}px`;

    // 添加数据属性
    label.dataset.string = pos.stringNum;
    label.dataset.fret = pos.fretNum;

    // 插入到指板容器
    document.getElementById('fretboard').appendChild(label);
}


////////////////////////////////////////////////////////////////
// 给按钮绑定点击事件
document.getElementById('toggleNotes').addEventListener('click', function () {
    this.classList.toggle('active');
    if (this.classList.contains('active')) {
        showScaleNotes();
    } else {
        document.querySelectorAll('.note-label').forEach(el => el.remove());
    }
});

document.getElementById('start').addEventListener('click', () => {
    generateQuestion();
});

document.querySelectorAll('.piano-key').forEach(key => {
    key.addEventListener('click', function () {
        if (!currentNote) return;
        const feedback = document.createElement('div');
        feedback.className = 'feedback';
        feedback.textContent = this.dataset.note === currentNote? '√' : 'X';
        feedback.style.color = this.dataset.note === currentNote? 'green' :'red';
        document.body.appendChild(feedback);
        document.querySelector('.note-label').textContent = currentNote;
        setTimeout(() => {
            feedback.remove();
            if (this.dataset.note === currentNote) {
                generateQuestion();
            }
        }, 1000);
    });
});





//**选择品范围和弦范围 *////////////////////////////////////////////////////
// 鼠标事件处理

let isSelecting = false;
let startBox = null;
let isSelectingstr=false;
let startBoxstr=null;

let fretStart=0;
let fretEnd=12;
let strStart=0;
let strEnd=6;

const selector = document.getElementById('range-selector');

selector.addEventListener('mousedown', e => {
    const box = e.target.closest('.range-box');
    if (box){
        isSelecting = true;
        startBox = box;
        clearSelection('.range-box');
        selectRange(box.dataset.value, box.dataset.value,'.range-box');
    }


    const box_str = e.target.closest('.range-box-string');
    if (box_str) {
        isSelectingstr = true;
        startBoxstr = box_str;
        clearSelection('.range-box-string');
        selectRange(box_str.dataset.value, box_str.dataset.value,'.range-box-string');
    }

});

document.addEventListener('mousemove', e => {
    if (!isSelecting) return;
    
    const endBox = e.target.closest('.range-box');
    if (!endBox || !selector.contains(endBox)) return;
    
    selectRange(startBox.dataset.value, endBox.dataset.value,'.range-box');
});

document.addEventListener('mouseup', () => {
    if (!isSelecting) return;
    isSelecting = false;
    
    const selected = [...document.querySelectorAll('.range-box.selected')]
        .map(box => parseInt(box.dataset.value));
    
    const start = Math.min(...selected);
    const end = Math.max(...selected);
    fretStart=start;
    fretEnd=end;
});

// 触摸事件处理
selector.addEventListener('touchstart', e => {
    const box = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
    )?.closest('.range-box');
    if (!box) return;
    
    e.preventDefault();
    isSelecting = true;
    startBox = box;
    clearSelection();
    selectRange(box.dataset.value, box.dataset.value,'.range-box');
});

document.addEventListener('touchmove', e => {
    if (!isSelecting) return;
    
    const endBox = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
    )?.closest('.range-box');
    
    if (endBox && selector.contains(endBox)) {
        selectRange(startBox.dataset.value, endBox.dataset.value,'.range-box');
    }
});

document.addEventListener('touchend', () => {
    isSelecting = false;
});

// 辅助函数
function clearSelection(boxclass) {
    document.querySelectorAll(boxclass).forEach(box => {
        box.classList.remove('selected');
    });
}

function selectRange(start, end,boxclass) {
    const startVal = parseInt(start);
    const endVal = parseInt(end);
    const min = Math.min(startVal, endVal);
    const max = Math.max(startVal, endVal);

    document.querySelectorAll(boxclass).forEach(box => {
        const val = parseInt(box.dataset.value);
        box.classList.toggle('selected', val >= min && val <= max);
    });

    if (boxclass===".range-box"){
        if (!isSelecting) return;
        isSelecting = false;
        
        const selected = [...document.querySelectorAll('.range-box.selected')]
            .map(box => parseInt(box.dataset.value));
        
        const start = Math.min(...selected);
        const end = Math.max(...selected);
        fretStart=start;
        fretEnd=end;

    }
    if (boxclass===".range-box-string"){
        if (!isSelecting) return;
        isSelecting = false;
        
        const selected = [...document.querySelectorAll('.range-box-string.selected')]
            .map(box => parseInt(box.dataset.value));
        const start = Math.min(...selected);
        const end = Math.max(...selected);
        strStart=start;
        strEnd=end;
    }
}


/////////////////////////////////////////////

document.addEventListener('mousemove', e => {
    if (!isSelectingstr) return;
    
    const endBox = e.target.closest('.range-box-string');
    if (!endBox || !selector.contains(endBox)) return;
    
    selectRange(startBoxstr.dataset.value, endBox.dataset.value,'.range-box-string');
});

document.addEventListener('mouseup', () => {
    if (!isSelectingstr) return;
    isSelectingstr = false;
    
    const selected = [...document.querySelectorAll('.range-box-string.selected')]
        .map(box => parseInt(box.dataset.value));
    
    const start = Math.min(...selected);
    const end = Math.max(...selected);
    strStart=start;
    strEnd=end;
});

// 触摸事件处理
selector.addEventListener('touchstart', e => {
    const box = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
    )?.closest('.range-box-string');
    if (!box) return;
    
    e.preventDefault();
    isSelectingstr = true;
    startBoxstr = box;
    clearSelection();
    selectRange(box.dataset.value, box.dataset.value,'.range-box-string');
});

document.addEventListener('touchmove', e => {
    if (!isSelectingstr) return;
    
    const endBox = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
    )?.closest('.range-box-string');
    
    if (endBox && selector.contains(endBox)) {
        selectRange(startBoxstr.dataset.value, endBox.dataset.value,'.range-box-string');
    }
});

document.addEventListener('touchend', () => {
    isSelectingstr = false;
});

