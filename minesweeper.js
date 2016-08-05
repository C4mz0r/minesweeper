"use strict";

const mine = 'M';
const empty = 'e';


function Board(width, numMines) {
    //this.dimension = width*width;
    this.width = width;
    this.numMines = numMines;
    this.squares = [];
    var self = this;

    // Initialized the grid
    for (let i = 0; i < width; i++){
        this.squares.push(new Array(width));
    }

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




    var checkArrayLocation = function(array, indexX, indexY, property, value) {
        if (indexX < 0 || indexX >= width)
            return false;

        if (array[indexX][indexY]) {
            if ((array[indexX][indexY])[property] == value)
                return true;
        }
        return false;
    };

    // Update square counts
    this.updateMineCounters = function () {
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

    this.render = function () {
        $("#content").empty();
        for (var i = 0; i < this.width; i++) {
            for (var j= 0; j < this.width; j++) {
                $("#content").append(this.squares[i][j].render());
            }
            //$("#content").append(this.squares[i].content);

            //if ( (i+1) % width == 0 )
                //$("#content").append("<br>");
        }

        $("#content").css("width", function() {
            return $(".square").width() * width + 20;
        } );
    };



    // Define this here instead of in Square, where it would otherwise
    // cause multiple bindings.
    $("#content").on('mousedown', '.square', function(event) {
        var index = $(this).index();
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
            } else
                return;
        }

        var row = Math.floor(index/width);
        var col = index%width;

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
                displayString = this.nearbyMinesCount;
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
    var board = new Board(10, 9);
    board.render();
});