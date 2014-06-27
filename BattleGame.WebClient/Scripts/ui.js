var ui = (function () {

    function buildLoginForm() {
        var html =
            '<div id="login-form-holder">' +
				'<form>' +
					'<div id="login-form">' +
						'<label for="tb-login-username">Username: </label>' +
						'<input type="text" id="tb-login-username"><br />' +
						'<label for="tb-login-password">Password: </label>' +
						'<input type="text" id="tb-login-password"><br />' +
						'<button id="btn-login" class="button">Login</button>' +
					'</div>' +
					'<div id="register-form" style="display: none">' +
						'<label for="tb-register-username">Username: </label>' +
						'<input type="text" id="tb-register-username"><br />' +
						'<label for="tb-register-nickname">Nickname: </label>' +
						'<input type="text" id="tb-register-nickname"><br />' +
						'<label for="tb-register-password">Password: </label>' +
						'<input type="password" id="tb-register-password"><br />' +
						'<button id="btn-register" class="button">Register</button>' +
					'</div>' +
					'<a href="#" id="btn-show-login" class="button selected">Login</a>' +
					'<a href="#" id="btn-show-register" class="button">Register</a>' +
				'</form>' +
            '</div>';

        return html;
    }

    function buildGameUI(nickname) {
        var html =
            '<div id="messages-container">' +
                '<h2>Messages: </h2>' +
                '<div id="messages"></div>' +
                '<button id="btn-messages-all">All messages</button>' +
                '<button id="btn-messages-unread">Unread messages</button>' +
            '</div>' +

            '<div id="highscore-container">' +
                '<h2>Highscore: </h2>' +
                '<div id="highscore"></div>' +
                '<button id="btn-get-highscore">Get Highscore</button>' +
            '</div>' +

            '<span id="user-nickname">' +
                nickname +
		    '</span>' +

		    '<button id="btn-logout">Logout</button><br/>' +

		    '<div id="create-game-holder">' +
			    'Title: <input type="text" id="tb-create-title" />' +
                'Password: <input type="text" id="tb-create-pass" />' +
			    '<button id="btn-create-game">Create</button>' +
		    '</div>' +

		    '<div id="open-games-container">' +
			    '<h2>Open</h2>' +
			    '<div id="open-games"></div>' +
		    '</div>' +

		    '<div id="active-games-container">' +
			    '<h2>Active</h2>' +
			    '<div id="active-games"></div>' +
		    '</div>' +

		    '<div id="game-holder">' +
		    '</div>';

        return html;
    }

    function buildOpenGamesList(games) {
        var list = '<ul class="game-list open-games">';
        for (var i = 0; i < games.length; i++) {
            var game = games[i];
            list +=
				'<li data-game-id="' + game.id + '">' +
					'<a href="#" >' +
						$("<div />").html(game.title).text() +
					'</a>' +
					'<span> by ' +
						game.creator +
					'</span>' +
				'</li>';
        }
        list += "</ul>";

        return list;
    }

    function buildActiveGamesList(games, nickname) {
        var gamesList = Array.prototype.slice.call(games, 0);

        gamesList.sort(function (g1, g2) {
            if (g1.status == g2.status) {
                return g1.title > g2.title;
            }
            else {
                if (g1.status == "in-progress") {
                    return -1;
                }
            }
            return 1;
        });

        var list = '<ul class="game-list active-games">';
        for (var i = 0; i < gamesList.length; i++) {
            var game = gamesList[i];

            list +=
				'<li data-game-id="' + game.id + '">' +
					'<a href="#" class="' + game.status + '">' +
						$("<div />").html(game.title).text() +
					'</a>' +
					'<span> by ' +
						game.creator +
					'</span>' +
				'</li>';
        }
        list += "</ul>";

        return list;
    }

    function buildGameField(fieldData) {

        var field =
            '<div id="game-field" data-game-id="' + fieldData.gameId + '">' +
            '<table>';

        var allUnits = fieldData.red.units.concat(fieldData.blue.units);

        for (var row = 0; row < 9; row++) {
            field += '<tr>';
            for (var col = 0; col < 9; col++) {
                field += '<td>';
                var isUnit = false;

                for (var i = 0; i < allUnits.length; i++) {
                    var unit = allUnits[i];

                    if ((unit.position.x == row) && (unit.position.y == col)) {
                        isUnit = true;

                        var unitType = "";
                        if (unit.type == "warrior") {
                            unitType = "W";
                        } else {
                            unitType = "R";
                        }

                        var unitMode = "";
                        if (unit.mode == "attack") {
                            unitMode = "att";
                        } else {
                            unitMode = "def";
                        }

                        field +=
                            '<div class="' + unit.owner + '-team unit" data-row="' + row + '" data-col="' + col +'">' +
                                '<a href="#" id="' + unit.id + '">' + unitType + '</a>' +
                                '<span>' + unit.hitPoints + ', <a class="mode">' + unitMode + '</a></span>' +
                            '</div>';
                    }
                }

                if (!isUnit) {
                    field += '<div class="empty-cell" data-row="' + row + '" data-col="' + col + '"></div>';
                }

                field += '</td>';
            }
            field += '</tr>';
        }

        field += '</table>';

        field += '<button id="btn-set-defend">Set to defend mode!</button>';

        return field;
    }

    return {
        loginForm: buildLoginForm,
        gameUI: buildGameUI,
        openGamesList: buildOpenGamesList,
        activeGamesList: buildActiveGamesList,
        gameField: buildGameField,
    }
}());