"use strict";

const mine = 'M';
const empty = ' ';
const flag = '\u2691';
const question = '?';

function Board(width, numMines) {
    this.width = width;
    this.numMines = numMines;
    this.flagCount = numMines;
    this.squares = [];
    this.headerWidth = undefined;
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
        var allNonMinesRevealed = function() {
            for (var i=0; i < self.width; i++) {
                for (var j=0; j < self.width; j++) {
                    if (self.squares[i][j].content === empty && !self.squares[i][j].revealed) {
                        return false;
                    }
                }
            }
            return true;
        };
        return allNonMinesRevealed();
    };

    this.render = function () {
        var content = $("#content");
        content.empty();
        for (var i = 0; i < this.width; i++) {
            $("#content").append("<div class='row'></div>");
            for (var j= 0; j < this.width; j++) {
                $(".row:last-of-type").append(this.squares[i][j].render());
            }
        }


        var gameHeader = $("#gameHeader");
        gameHeader.empty();
        gameHeader.append("<span id='clock'>Time: </span><span id='time'></span>");
        gameHeader.append("<span id='flags'>Flagged: "+this.flagCount+"</span>");
        console.log($(".square").width() * this.width);
        this.headerWidth = this.headerWidth || ($("div.square").width() + 2 * parseInt($("div.square").css("border-width"),10) )* this.width;
        gameHeader.width(this.headerWidth);

        $(".flagged").text(flag);
        $(".questioned").text(question);


        if (this.isWinner()) {
            content.append("<div id='gameOver'>You win!</div>");
            var gameOver = $("#gameOver");
            gameOver.css('width', this.headerWidth);
            gameOver.css('height', this.headerWidth);
            timer.stopTimer();
        } else if (this.isLoser()) {
            content.append("<div id='gameOver'>You blew it!</div>");
            var gameOver = $("#gameOver");
            gameOver.css('width', this.headerWidth);
            gameOver.css('height', this.headerWidth);
            timer.stopTimer();
        };

    };


    // Define this here instead of in Square, where it would otherwise
    // cause multiple bindings.
    $("#content").on('mousedown', '.square', function(event) {

        // Start the timer if not already going
        timer.startTimer();

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
            if (self.squares[i][j].flagged === true)
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

        self.flagCount += self.squares[row][col].squareClicked(event);
        console.log("Flag count is " + self.flagCount);

        self.render();
    });

    $("#content").contextmenu(function() {
        return false;
    });

    var Timer = function(){
        var currentTime = 1;
        var timerString = function() {
            $("#time").text(currentTime);
            currentTime++;
        };
        var timerId;
        return {
            startTimer: function() {
                if (!timerId)
                    timerId = setInterval(timerString, 1000);
            },
            stopTimer: function() {
                clearInterval(timerId);
                $("#time").text(currentTime);
            }
        };
    };

    var timer = Timer();
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
            return toggleStatus();
        } else {
            if (this.flagged || this.questioned)
                return 0; // do not reveal squares that are flagged/questioned
            reveal();
        }
        return 0; // no change to flag count
    };

    var reveal = function() {
        console.log("called reveal");
        self.revealed = true;
    };

    // Toggle status and return the net amount of available flags
    // resulting from the move (i.e. -1, 0 or 1)
    var toggleStatus = function() {
        if (self.revealed) {
            return 0;
        }
         if (!self.flagged && !self.questioned) {
             self.flagged = true;
             return -1;
        } else if (self.flagged && !self.questioned) {
            self.flagged = false;
            self.questioned = true;
             return +1;
        } else if (self.questioned) {
            self.flagged = false;
            self.questioned = false;
             return 0;
        }

        return 0;
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