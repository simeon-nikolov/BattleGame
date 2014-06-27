/// <reference path="class.js" />
/// <reference path="persister.js" />
/// <reference path="jquery-2.0.2.js" />
/// <reference path="ui.js" />

var controllers = (function () {
    var rootUrl = "http://localhost:22954/api/";
    var unitId = "";

    var Controller = Class.create({
        init: function () {
            this.persister = persisters.get(rootUrl);
        },
        loadUI: function (selector) {
            if (this.persister.isUserLoggedIn()) {
                this.loadGameUI(selector);
            }
            else {
                this.loadLoginFormUI(selector);
            }

            this.attachUIEventHandlers(selector);
        },
        loadLoginFormUI: function (selector) {
            var loginFormHtml = ui.loginForm()
            $(selector).html(loginFormHtml);
        },
        loadGameUI: function (selector) {
            var gameContent =
				ui.gameUI(this.persister.nickname());
            $(selector).html(gameContent);

            this.persister.game.open(function (games) {
                var list = ui.openGamesList(games);
                $(selector + " #open-games")
					.html(list);
            });

            var self = this;

            this.persister.game.myActive(function (games) {
                var nickname = self.persister.nickname();
                var list = ui.activeGamesList(games, nickname);
                $(selector + " #active-games")
					.html(list);
            });
        },
        loadGame: function (selector, gameId) {
            var self = this;
            this.persister.game.field(gameId, function (fieldData) {
                var gameHtml = ui.gameField(fieldData);
                $(selector + " #game-holder").html(gameHtml);
                setTimeout(function () { self.loadGame(selector, gameId) }, 2000);
            }, function () {
                alert("Error loading game!");
            });
        },
        loadHighscore: function (selector) {
            this.persister.user.scores(function (data) {
                var htmlText = '';

                data.sort(function (s1, s2) {
                    if (s1.score == s2.score) {
                        return s1.nickname > s2.nickname;
                    }
                    else {
                        return s1.score < s2.score;
                    }
                    return 1;
                });

                for (var i = 0; i < data.length; i++) {
                    var scoreData = data[i];
                    htmlText +=
                        '<p>' +
                            'Nickname: ' + scoreData.nickname +
                            ', Score: ' + scoreData.score +
                        '</p>';
                }

                $(selector).html(htmlText);
            },
        function () {
            $(selector).html("Error loading highscore!");
        });
        },
        attachUIEventHandlers: function (selector) {
            var wrapper = $(selector);
            var self = this;

            wrapper.on("click", "#btn-show-login", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#login-form").show();
                wrapper.find("#register-form").hide();
            });

            wrapper.on("click", "#btn-show-register", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#register-form").show();
                wrapper.find("#login-form").hide();
            });

            wrapper.on("click", "#btn-login", function () {
                var user = {
                    username: $(selector + " #tb-login-username").val(),
                    password: $(selector + " #tb-login-password").val()
                }

                self.persister.user.login(user, function () {
                    self.loadGameUI(selector);
                }, function () {
                    wrapper.html("oh no..");
                });

                return false;
            });

            wrapper.on("click", "#btn-register", function () {
                var userData = {
                    username: $("#tb-register-username").val(),
                    nickname: $("#tb-register-nickname").val(),
                    password: $("#tb-register-password").val(),
                };

                self.persister.user.register(userData, function () {
                    alert("Succesfuly registered!");
                }, function () {
                    alert("Error - can't register!");
                });
            });

            wrapper.on("click", "#btn-logout", function () {
                self.persister.user.logout(function () {
                    self.loadLoginFormUI(selector);
                });
            });

            wrapper.on("click", "#open-games-container a", function () {
                $("#game-join-inputs").remove();
                var html =
                    '<div id="game-join-inputs">' +
                        'Password: <input type="text" id="tb-game-pass"/>' +
                        '<button id="btn-join-game">join</button>' +
                    '</div>';
                $(this).after(html);
            });

            wrapper.on("click", "#btn-join-game", function () {
                var game = {
                    gameId: $(this).parents("li").first().data("game-id")
                };

                var password = $("#tb-game-pass").val();

                if (password) {
                    game.password = password;
                }

                self.persister.game.join(game, function () {
                    alert("Successfuly joind game!");
                }, function () {
                    alert("Error joining game!");
                });

                setTimeout(function () { self.loadGameUI(selector) }, 1000);
            });

            wrapper.on("click", "#btn-create-game", function () {
                var game = {
                    title: $("#tb-create-title").val(),
                }

                var password = $("#tb-create-pass").val();

                if (password) {
                    game.password = password;
                }

                self.persister.game.create(game, function () {
                    alert("Game successfuly created!");
                }, function () {
                    alert("Error while creating game!");
                });

                setTimeout(function () { self.loadGameUI(selector) }, 1000);
            });

            wrapper.on("click", ".active-games .in-progress", function () {
                self.loadGame(selector, $(this).parent().data("game-id"));
            });

            wrapper.on("click", ".active-games a.full", function () {
                $("#game-start-inputs").remove();

                var html =
                    '<div id="game-start-inputs">' +
                        '<button id="btn-start-game">Start Game</button>' +
                    '</div>';

                $(this).after(html);
            }); // to do - only to owner to show

            wrapper.on("click", "#btn-start-game", function () {
                var gameId = $(this).parents("li").first().data("game-id");

                self.persister.game.start(gameId, function () {
                    alert("Successfuly started game!");
                }, function () {
                    alert("Error starting game!");
                });

                setTimeout(function () { self.loadGameUI(selector) }, 1000);
            });

            wrapper.on("click", "#btn-get-highscore", function () {
                self.loadHighscore("#highscore");
            });

            wrapper.on("click", ".unit", function (e) {
                if (unitId != "") {
                    var gameId = $("#game-field").attr("data-game-id");
                    var row = $(this).attr('data-row');
                    var col = $(this).attr('data-col');

                    var unit = {
                        unitId: unitId,
                        position: { x: row, y: col }
                    }

                    self.persister.battle.attack(gameId, unit, function () {
                        setTimeout(function () { self.loadGame(selector, gameId) }, 500);
                    }, function () {
                        alert("Error attacking!");
                    });

                    unitId = "";
                } else {
                    unitId = $(this).find("a").first().attr("id");
                }
            });

            wrapper.on("click", ".empty-cell", function () {
                if (unitId != "") {
                    var gameId = $("#game-field").attr("data-game-id");
                    var row = $(this).attr('data-row');
                    var col = $(this).attr('data-col');

                    var unit = {
                        unitId: unitId,
                        position: { x: row, y: col }
                    }

                    self.persister.battle.move(gameId, unit, function () {
                        setTimeout(function () { self.loadGame(selector, gameId) }, 500);
                    }, function () {
                        alert("Error moving!");
                    });

                    unitId = "";
                }
            });

            wrapper.on("click", "#btn-set-defend", function () {
                if (unitId != "") {
                    var gameId = $("#game-field").attr("data-game-id");

                    self.persister.battle.defend(gameId, unitId, function () {
                        setTimeout(function () { self.loadGame(selector, gameId) }, 500);
                    }, function () {
                        alert("Error attacking!");
                    });

                    unitId = "";
                }
            });

            wrapper.on("click", "#btn-messages-all", function () {
                self.persister.message.all(function (data) {
                    var htmlText = '';

                    for (var i = 0; i < data.length; i++) {
                        var msgData = data[i];
                        htmlText +=
                            '<p>' +
                                'Text: ' + msgData.text +
                                ', GameID: ' + msgData.gameId +
                            '</p>';
                    }

                    $("#messages").html(htmlText);
                },
                function () {
                    $(selector).html("Error loading highscore!");
                });
            });

            wrapper.on("click", "#btn-messages-all", function () {
                self.persister.message.unread(function (data) {
                    var htmlText = '';

                    for (var i = 0; i < data.length; i++) {
                        var msgData = data[i];
                        htmlText +=
                            '<p>' +
                                'Text: ' + msgData.text +
                                ', GameID: ' + msgData.gameId +
                            '</p>';
                    }

                    $("#messages").html(htmlText);
                },
                function () {
                    $(selector).html("Error loading highscore!");
                });
            });

        }
    });

    return {
        get: function () {
            return new Controller();
        }
    }
}());

$(function () {
    var controller = controllers.get();
    controller.loadUI("#content");
});