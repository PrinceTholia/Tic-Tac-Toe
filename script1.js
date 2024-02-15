// Define the TicTacToe class to represent the Tic Tac Toe game
class TicTacToe {
    constructor() {
        // Initialize the game board, moves, and game status variables
        this.board = Array(9).fill(0); // Represents the Tic Tac Toe board with 9 cells (initially empty)
        this.moves = []; // Keeps track of moves made
        this.isWin = this.isDraw = false; // Flags indicating game status (win, draw)
    }

    // Getter method to determine whose turn it is (player 1 or player 2)
    get turn() {
        return 1 + this.moves.length % 2; // Returns 1 for player 1's turn, 2 for player 2's turn
    }

    // Getter method to return an array of valid moves (indices of empty cells on the board)
    // Returns 0 for empty and -1 for non-empty and then -1 are removed
    get validMoves() {
        return this.board.map((cell, index) => cell === 0 ? index : -1).filter(index => index !== -1);
    }

    // Method to make a move on the board
    play(move) {
        // Check if the move is valid and if the game is already won
        if (this.board[move] !== 0 || this.isWin) return false; // Invalid move or game already won
        
        // Assign the current player's number to the cell and update moves made
        this.board[move] = this.turn; // 1 or 2 (player number)
        this.moves.push(move); // Add the move to the list of moves made

        // Check for win/draw conditions after the move
        this.isWin = /^(?:...)*([12])\1\1|^.?.?([12])..\2..\2|^([12])...\3...\3|^..([12]).\4.\4/.test(this.board.join(""));
        this.isDraw = !this.isWin && this.moves.length === this.board.length; // Check for draw condition
        return true; // Return true indicating a successful move
    }

    // Method to undo the last move made
    takeBack() {
        // Check if there are moves to undo
        if (this.moves.length === 0) return false; // No moves to undo
        
        // Reset the last move made, reset win/draw flags
        this.board[this.moves.pop()] = 0; // Reset the cell to empty
        this.isWin = this.isDraw = false; // Reset win/draw flags
        return true; // Return true indicating a successful undo
    }

    // Method implementing the Minimax algorithm with alpha-beta pruning to find the best move
    minimax(alpha = -Infinity, beta = Infinity, depth = Infinity) {
        // Base cases: return values for win/loss/draw states or reaching max depth
        if (this.isWin || this.isDraw || depth === 0) {
            if (this.isWin) return { value: -10 };
            if (this.isDraw) return { value: 0 };
            return { value: 0 }; // Return 0 at max depth
        }
        
        // Initialize the best move value
        let best = { value: -Infinity };
        
        // Iterate over valid moves and recursively evaluate each move
        for (let move of this.validMoves) {
            // Make the move and recursively call minimax to evaluate the move
            this.play(move); // Make the move
            let {value} = this.minimax(alpha, beta, depth - 1); // Recursively call minimax to evaluate the move
            this.takeBack(); // Undo the move
            
            // Reduce and negate the value (shorter paths to wins are prioritized)
            value = value ? (Math.abs(value) - 1) * Math.sign(-value) : 0;
            
            // Update the best move if the current move is better or equally good
            if (value >= best.value) {
                if (value > best.value) best = { value, moves: [] };
                best.moves.push(move);
            }
            
            // Implement alpha-beta pruning
            if (this.turn === 1) { // Maximizer's turn
                alpha = Math.max(alpha, value);
            } else { // Minimizer's turn
                beta = Math.min(beta, value);
            }
            if (beta <= alpha) break; // Beta cutoff
        }
        return best; // Return the best move
    }

    // Method to select a good move randomly from equally valued moves
    goodMove() {
        const pruningDepth = parseInt(document.getElementById("prundepth").value);
        let {moves} = this.minimax(-Infinity, Infinity, pruningDepth); // Get equally valued moves from minimax
        return moves[Math.floor(Math.random() * moves.length)]; // Select a random move
    }
}

// Immediately invoked function expression (IIFE) to encapsulate the code and prevent global scope pollution
(function() {
    // Get references to HTML elements
    const table = document.getElementById("game"); // Table element representing the game board
    const btnNewGame = document.getElementById("newgame"); // Button to start a new game
    const btnCpuMove = document.getElementById("cpumove"); // Button to let CPU play a move
    const messageArea = document.getElementById("message"); // Area to display game messages
    const btnUndoMove = document.querySelector("#undoMove");
    // Initialize game and player variables
    let game, human;

    // Function to update the display of the game board and messages
    function display() {
        // Update the display of each cell on the game board
        game.board.forEach((cell, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            table.rows[row].cells[col].className = " XO"[cell];
        });
        
        // Update the message area with game status messages
        messageArea.textContent = game.isWin ? (game.turn == human ? "CPU won" : "You won")
                                : game.isDraw ? "It's a draw"
                                : game.turn == human ? "Your turn" 
                                : "CPU is preparing move...";
        
        // Disable the game board if the game is over or it's CPU's turn
        table.className = game.isWin || game.isDraw || game.turn !== human ? "inactive" : "";
    }

    // Function to handle CPU's move
    function computerMove() {
        // Ignore if the game is already won or drawn
        if (game.isWin || game.isDraw) return; 

        // Determine the human player's number
        human = 3 - game.turn;
        
        // Update the display and wait for a short delay before CPU's move
        display();
        var startTime = performance.now();
            game.play(game.goodMove()); // Make a move using the Minimax algorithm
        var endTime = performance.now();
        var elapsedTime = endTime - startTime;

console.log("Elapsed time: " + elapsedTime + " milliseconds");
            display(); // Update the display after the move
    }

    // Function to handle human player's move
    function humanMove(i) {
        // Ignore if it's not human player's turn or the move is invalid
        if (game.turn !== human || !game.play(i)) return;
        
        // Update the display and let CPU play its move
        display();
        computerMove();
    }

    // Function to start a new game
    function newGame() {
        // Create a new instance of TicTacToe game and reset human player's number
        game = new TicTacToe();
        human = 1; // Set human player as player 1 by default
        display(); // Update the display for the new game
    }

    // Event listener for clicking on a cell in the game board
    table.addEventListener("click", e => {
        // Check if the clicked element is a table cell and it belongs to the game board
        if (e.target.tagName === 'TD' && e.target.closest('table') === table) {
            // Calculate the row and column indices of the clicked cell
            const row = e.target.parentNode.rowIndex;
            const col = e.target.cellIndex;
            const cellIndex = row * 3 + col; // Calculate the cell index in the flat array representation
            humanMove(cellIndex); // Handle the human player's move
        }
    });
    
    // Event listener for the "New Game" button
    btnNewGame.addEventListener("click", newGame);

    // Event listener for the "Let CPU play a move" button
    btnCpuMove.addEventListener("click", computerMove);

    btnUndoMove.addEventListener("click", () => {
        if (game.takeBack()) {
            display(); // Update the game display after undoing the move
        } else {
            console.log("No moves to undo.");
        }
    });
    // Start a new game when the page is loaded
    newGame();
})();
