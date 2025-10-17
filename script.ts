let gridSize = 5; // default starting size

const display = document.getElementById("gridSizeDisplay")!;
const increaseBtn = document.getElementById("increaseGrid")!;
const decreaseBtn = document.getElementById("decreaseGrid")!;
const gridContainer = document.getElementById("gridContainer")!; // a <div> for your table
const solveButton = document.getElementById("solveButton") as HTMLButtonElement;

const colorList = ["#FFB1B1","#C0DCFF","#FBF0B7","#D4CBFE","#FFE1BC","#FFB8EF","#C3F1CB","#EFCEC2","#CCF0F9"];
let selectedColor: string | null = null;

createColorKey();
generateGrid(gridSize); // initial grid

display.textContent = String(gridSize);

increaseBtn.addEventListener("click", () => {
  if (gridSize < 9) {
    gridSize++;
    display.textContent = String(gridSize);
    generateGrid(gridSize);
    createColorKey();
  }
});

decreaseBtn.addEventListener("click", () => {
  if (gridSize > 1) {
    gridSize--;
    display.textContent = String(gridSize);
    generateGrid(gridSize);
    createColorKey();
  }
});

function generateGrid(size: number) {
  gridContainer.innerHTML = ""; // Clear previous grid

  const table = document.createElement("table");

  // Column sum inputs (top row)
  const colSumRow = document.createElement("tr");
  colSumRow.appendChild(document.createElement("td")); // empty top-left corner
  for (let col = 0; col < size; col++) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.className = "col-sum";
    input.id = `colsum-${col}`;
    td.appendChild(input);
    colSumRow.appendChild(td);
  }
  table.appendChild(colSumRow);

  // Grid with row sums (on the left)
  for (let row = 0; row < size; row++) {
    const tr = document.createElement("tr");

    // Row sum input (first cell in the row)
    const rowSumTd = document.createElement("td");
    const rowSumInput = document.createElement("input");
    rowSumInput.type = "number";
    rowSumInput.className = "row-sum";
    rowSumInput.id = `rowsum-${row}`;
    rowSumTd.appendChild(rowSumInput);
    tr.appendChild(rowSumTd);

    // Main grid cells
    for (let col = 0; col < size; col++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.classList.add("main-cell");
      input.type = "number";
      input.min = "0";
      input.max = "9";
      input.className = "cell";
      input.id = `cell-${row}-${col}`;

      td.appendChild(input);
      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  gridContainer.appendChild(table);

  // After table is added to DOM

  const allInputs = document.querySelectorAll("input");

  allInputs.forEach(input => {
    input.addEventListener("keydown", (e: KeyboardEvent) => {
      const id = input.id;

      const cellMatch = id.match(/^cell-(\d+)-(\d+)$/);
      const rowSumMatch = id.match(/^rowsum-(\d+)$/);
      const colSumMatch = id.match(/^colsum-(\d+)$/);

      let row: number | null = null;
      let col: number | null = null;

      if (cellMatch) {
        row = parseInt(cellMatch[1]);
        col = parseInt(cellMatch[2]);
      } else if (rowSumMatch) {
        row = parseInt(rowSumMatch[1]);
        col = -1;
      } else if (colSumMatch) {
        row = -1;
        col = parseInt(colSumMatch[1]);
      }

      if (row === null || col === null) return;

      let nextId = "";

      switch (e.key) {
        case "ArrowRight": col++; break;
        case "ArrowLeft": col--; break;
        case "ArrowDown": row++; break;
        case "ArrowUp": row--; break;
        default: return;
      }

      e.preventDefault();

      if (row === -1) {
        nextId = `colsum-${col}`;
      } else if (col === -1) {
        nextId = `rowsum-${row}`;
      } else {
        nextId = `cell-${row}-${col}`;
      }

      const next = document.getElementById(nextId) as HTMLInputElement | null;
      if (next) next.focus();
    });
  });

  const allCells = document.querySelectorAll(".cell") as NodeListOf<HTMLInputElement>;
  allCells.forEach(cell => {
    cell.addEventListener("input", updateSolveButtonState);

    // Add color selection logic
    cell.addEventListener("click", () => {
      if (selectedColor) {
        cell.style.backgroundColor = selectedColor;
        cell.dataset.color = selectedColor;
      }
    });

    (cell.parentElement as HTMLTableCellElement).addEventListener("click", updateSolveButtonState);
  });
  updateSolveButtonState(); // Run once after generating the grid
}

function createColorKey() {
  const keyContainer = document.getElementById("colorKey")!;
  keyContainer.innerHTML = "";

  const colorsShow = colorList.slice(0, gridSize);

  colorsShow.forEach(color => {
    const wrapper = document.createElement("div");
    wrapper.className = "color-option";

    const colorBox = document.createElement("div");
    colorBox.className = "color-box";
    colorBox.style.backgroundColor = color;
    colorBox.dataset.color = color;

    const input = document.createElement("input");
    input.className = "color-input";
    input.type = "number";
    input.min = "0";
    input.max = "99";
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
    });

    colorBox.addEventListener("click", () => {
      document.querySelectorAll(".color-box").forEach(b => b.classList.remove("selected"));
      colorBox.classList.add("selected");
      selectedColor = color;
    });

    wrapper.appendChild(colorBox);
    wrapper.appendChild(input);
    keyContainer.appendChild(wrapper);
  });

  updateSolveButtonState();
}

function getColorData(): string[][] {
  const colorData: string[][] = [];

  for (let row = 0; row < gridSize; row++) {
    const rowColors: string[] = [];
    for (let col = 0; col < gridSize; col++) {
      const cell = document.getElementById(`cell-${row}-${col}`) as HTMLInputElement;
      const color = cell?.dataset.color || ""; // Empty string if no color
      rowColors.push(color);
    }
    colorData.push(rowColors);
  }

  return colorData;
}

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  // If click is NOT inside a cell or a color-box, clear the selection
  if (
    !target.closest(".cell") &&
    !target.closest(".color-box") &&
    !target.closest(".color-input") &&
    !target.closest(".color-option")
  ) {
    document.querySelectorAll(".color-box").forEach(b => b.classList.remove("selected"));
    selectedColor = null;
  }
});

function rgbToHex(rgb: string): string {
  const result = rgb.match(/\d+/g);
  if (!result) return "";
  return (
    "#" +
    result
      .slice(0, 3)
      .map(x => parseInt(x).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function buildPayload() {
  const gridSize = Number(display.textContent);
  const cells: number[][] = [];
  const cellColors: string[][] = [];
  const rowSums: number[] = [];
  const colSums: number[] = [];
  const colorValues: { [color: string]: number } = {};

  // Main cells
  for (let row = 0; row < gridSize; row++) {
    const rowValues: number[] = [];
    const rowColorValues: string[] = [];

    for (let col = 0; col < gridSize; col++) {
      const cell = document.getElementById(`cell-${row}-${col}`) as HTMLInputElement;
      rowValues.push(Number(cell.value));
      rowColorValues.push(cell.dataset.color || "");
    }

    cells.push(rowValues);
    cellColors.push(rowColorValues);
  }

  // Row sums
  for (let row = 0; row < gridSize; row++) {
    const input = document.getElementById(`rowsum-${row}`) as HTMLInputElement;
    rowSums.push(Number(input.value));
  }

  // Column sums
  for (let col = 0; col < gridSize; col++) {
    const input = document.getElementById(`colsum-${col}`) as HTMLInputElement;
    colSums.push(Number(input.value));
  }

  // Color sum inputs (from color key)
  document.querySelectorAll(".color-option").forEach(option => {
    const colorBox = option.querySelector(".color-box") as HTMLElement;
    const input = option.querySelector(".color-input") as HTMLInputElement;
    if (colorBox && input) {
      const rgb = colorBox.style.backgroundColor;
      const hex = rgbToHex(rgb);
      colorValues[hex] = Number(input.value);
    }
  });

  return {
    gridSize,
    cells,
    rowSums,
    colSums,
    cellColors,
    colorValues
  };
}

const solveBtn = document.getElementById("solveButton")!;
solveBtn.addEventListener("click", () => {
  const payload = buildPayload();
  fetch("/solve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      const solution = data.solution;
      console.log("Solution grid:", solution);
      renderSolutionGrid(solution);
    });
});

function updateSolveButtonState() {
  const allCells = document.querySelectorAll(".cell") as NodeListOf<HTMLInputElement>;
  const allFilled = Array.from(allCells).every(cell => {
    const value = cell.value.trim();
    const color = cell.dataset.color;  // FIXED LINE
    return value !== "" && color;
  });

  solveButton.disabled = !allFilled;
}

function renderSolutionGrid(solution: number[][]) {
  const container = document.getElementById("solutionGrid")!;
  const label = document.getElementById("solutionLabel")!;
  container.innerHTML = ""; // Clear previous solution
  label.style.display = "block"; 

  const table = document.createElement("table");

  for (let row = 0; row < solution.length; row++) {
    const tr = document.createElement("tr");

    for (let col = 0; col < solution[row].length; col++) {
      const td = document.createElement("td");
      td.className = "readonly-cell";
    
      if (solution[row][col] !== 0) {
        const circle = document.createElement("div");
        circle.className = "circle";
        circle.textContent = String(solution[row][col]);
        td.appendChild(circle);
      }
    
      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  container.appendChild(table);
}
