from flask import Flask, request, send_from_directory
from flask_cors import CORS
import os
from flask import jsonify

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()

    grid = data["cells"]
    row_sums = data["rowSums"]
    column_sums = data["colSums"]
    cell_colors = data["cellColors"]
    color_values = data["colorValues"]

    print("Grid:", grid)
    print("Row sums:", row_sums)    
    print("Column sums:", column_sums)
    print("Cell colors:", cell_colors)
    print("Color values:", color_values)

    def find_valid_masks(row, targetsum):
        n = len(row)
        winners = []
        for i in range(2**n):
            bits = [int(b) for b in bin(i)[2:].zfill(n)]
            dot = sum(x * y for x, y in zip(row, bits))
            if dot == targetsum:
                winners.append(i)
        return winners

    valid_masks = {}

    for i in range(len(grid)):
        valid_masks[i] = find_valid_masks(grid[i], row_sums[i])

    def apply_mask(mask, row_vals, col_totals):
        n = len(row_vals)
        new_totals = col_totals[:]
        for j in range(n):
            if mask & (1 << (n - 1 - j)):
                new_totals[j] += row_vals[j]
        return new_totals

    def is_valid(col_totals, column_sums):
        for i in range(len(column_sums)):
            if col_totals[i] > column_sums[i]:
                return False
        return True

    n = len(grid)

    def search(row_index, path, col_totals):
        if row_index == n:
            if col_totals == column_sums:
                winners.append(path[:])
            return
        for mask in valid_masks[row_index]:
            new_col_totals = apply_mask(mask, grid[row_index], col_totals)
            if is_valid(new_col_totals, column_sums):
                search(row_index + 1, path + [mask], new_col_totals)

    winners = []
    search(0, [], [0] * len(column_sums))

    print("Solutions found:", len(winners))
    for solution in winners:
        print(solution)

    
    filtered_winners = []

    for solution in winners:
        color_totals = {color: 0 for color in color_values}

        for r in range(len(grid)):
            mask = solution[r]
            for c in range(len(grid[0])):
                if mask & (1 << (len(grid[0]) - 1 - c)):
                    color = cell_colors[r][c]
                    if color in color_totals:
                        color_totals[color] += grid[r][c]

        if all(color_totals[color] == color_values[color] for color in color_values):
            filtered_winners.append(solution)

    winners = filtered_winners

    solution_grid = []
    for i, row_mask in enumerate(winners[0]):
        mask_vector = [0] * n
        for j in range(n):
            if row_mask & (1 << (n - 1 - j)):
                mask_vector[j] = 1
        row_solution = [grid[i][j] * mask_vector[j] for j in range(n)]
        solution_grid.append(row_solution)

    print("SOLUTION GRID:")
    print(solution_grid)
    return jsonify({"solution": solution_grid})