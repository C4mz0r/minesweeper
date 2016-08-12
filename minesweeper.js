"use strict";

const mine = 'M';
const empty = ' ';
const flag = '\u2691'
const question = '?';

function Board(width, numMines) {
    this.width = width;
    this.numMines = numMines;
    this.squares = [];
    var self = this;

    // Initialized the grid
    for (var i = 0; i < width; i++){
        this.squares.push(new Array(width));
    }

    // Randomly select where mines will be placed
    this.chooseMinePositions = function(width, numMines) {
        var plantMines = [];
        while( plantMines.length < numMines ) {
            var minePosition = Math.floor(Math.random()*width*width);
            if ( plantMines.indexOf(minePosition) === -1 )
                plantMines.push(minePosition);
            console.log("try to add " + minePosition+  " to set ");
        }
        return plantMines;
    };



    // Update the adjacent mine count for each square
    this.updateMineCounters = function () {

        // Checks if specified property and value is present in specified location in 2d array
        var checkArrayLocation = function(array, row, col, property, value) {
            if (row < 0 || row >= width) // out of bounds
                return false;
            if (array[row][col]) {
                if ((array[row][col])[property] == value)
                    return true;
            }
            return false;
        };

        for (var i = 0; i < self.squares.length; i++) {
            for (var j = 0; j < self.squares.length; j++) {
                var count = 0;
                if (checkArrayLocation(self.squares, i - 1, j - 1, 'content', mine))
                    count++;
                if (checkArrayLocation(self.squares, i - 1, j, 'content', mine))
                    count++;
                if (checkArrayLocation(self.squares, i - 1, j + 1, 'content', mine))
                    count++;
                if (checkArrayLocation(self.squares, i, j - 1, 'content', mine))
                    count++;
                if (checkArrayLocation(self.squares, i, j + 1, 'content', mine))
                    count++;
                if (checkArrayLocation(self.squares, i + 1, j - 1, 'content', mine))
                    count++;
                if (checkArrayLocation(self.squares, i + 1, j, 'content', mine))
                    count++;
                if (checkArrayLocation(self.squares, i + 1, j + 1, 'content', mine))
                    count++;
                this.squares[i][j].nearbyMinesCount = count;
            }
        }
    };


    var mines = this.chooseMinePositions(this.width, this.numMines);
    for(var i=0; i < this.width; i++) {
        for(var j=0; j < this.width; j++) {
            this.squares[i][j] = new Square( mines.indexOf(i*this.width+j) !== -1 ? mine : empty);
        }
    }
    this.updateMineCounters();

    this.isLoser = function() {
        var lost = false;
        for (var i = 0; i < self.width; i++) {
            for (var j = 0; j < self.width; j++) {
                if (self.squares[i][j].content === mine && self.squares[i][j].revealed) {
                    lost = true;
                    break;
                }
            }
        }
      return lost;
    };

    this.isWinner = function() {
        var flaggedAndRevealed = function (totalMines) {
            var correct = 0;
            var allNonMinesRevealed = undefined;
            for (var i = 0; i < self.width; i++) {
                for (var j = 0; j < self.width; j++) {
                    if (self.squares[i][j].content === mine && self.squares[i][j].flagged === true) {
                        correct++;
                    }
                    else if (!(self.squares[i][j].content === empty && self.squares[i][j].revealed)) {
                        allNonMinesRevealed = false;
                        break;
                    }
                }
            }
            return (totalMines === correct && allNonMinesRevealed !== false);
        };
    return flaggedAndRevealed(this.numMines);
}

    this.render = function () {
        var content = $("#content");
        content.empty();
        for (var i = 0; i < this.width; i++) {
            $("#content").append("<div class='row'></div>");
            for (var j= 0; j < this.width; j++) {
                $(".row:last-of-type").append(this.squares[i][j].render());
            }
        }

        /*
        content.css("width", function() {
            return $(".square").width() * width + 20;
        } );*/

        $(".flagged").text(flag);
        $(".questioned").text(question);


        if (this.isWinner()) {
            content.append("<div id='gameOver'>You win!</div>");
        } else if (this.isLoser()) {
            content.append("<div id='gameOver'>You blew it!</div>");
        };

    };


    // Define this here instead of in Square, where it would otherwise
    // cause multiple bindings.
    $("#content").on('mousedown', '.square', function(event) {

        // When clicking on a square, we need to calculate which row that square is in.
        // The square's parent is the row, so we can determine the index of the row we have clicked.
        var rowIndex = $(this).parent().index();
        // The column's index is the index of the square we have clicked in a particular row.
        var colIndex = $(this).index();
        var index = rowIndex * width + colIndex;


        // Recursively reveal the empty areas around the clicked position
        function recursiveReveal(i,j) {
            if (i < 0 || i >= width) return;
            if (j < 0 || j >= width) return;
            if (self.squares[i][j].revealed === true)
                return;
            if (self.squares[i][j].nearbyMinesCount > 0) {
                self.squares[i][j].revealed = true;
                return;
            }
            if (self.squares[i][j].content === empty) {
                self.squares[i][j].revealed = true;
                recursiveReveal(i-1, j-1);
                recursiveReveal(i-1, j);
                recursiveReveal(i-1, j+1);
                recursiveReveal(i, j-1);
                recursiveReveal(i, j+1);
                recursiveReveal(i+1, j-1);
                recursiveReveal(i+1, j);
                recursiveReveal(i+1, j+1);
            }
        }

        var row = Math.floor(index / width);
        var col = index % width;

        if (event.which == 1)
            recursiveReveal(row,col);

        self.squares[row][col].squareClicked(event);

        self.render();
    });

    $("#content").contextmenu(function() {
        return false;
    });
}

function Square(content) {
    this.content = content;
    this.flagged = false;
    this.questioned = false;
    this.revealed = false;
    this.nearbyMinesCount = undefined;
    var self = this;

    // This function is called when the mousedown handler in Board
    // is called.
    this.squareClicked = function(event) {
        if (event.which == 3) {
            toggleStatus();
        } else {
            reveal();
        }
    };

    var reveal = function() {
        console.log("called reveal");
        self.revealed = true;
    };

    var toggleStatus = function() {
         if (!self.flagged && !self.questioned) {
            self.flagged = true;
        } else if (self.flagged && !self.questioned) {
            self.flagged = false;
            self.questioned = true;
        } else if (self.questioned) {
            self.flagged = false;
            self.questioned = false;
        }
    };

    this.render = function() {
        var displayString = empty;
        var theClass = "square";

        if (this.revealed) {
            if (this.content == mine)
                displayString = this.content;
            else
                displayString = this.nearbyMinesCount || empty;
            theClass += " revealed";
        } else {
            theClass += " unrevealed";
            if (this.questioned) {
                theClass += " questioned";
            } else if (this.flagged) {
                theClass += " flagged";
            }
        }
        return "<div class='"+ theClass +"'>" + displayString + "</div>";
    }
}
$(function(){
    var board = new Board(9, 10);
    board.render();
});