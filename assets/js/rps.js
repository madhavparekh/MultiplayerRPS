// Initialize Firebase
var player = {
	name: '',
	pick: 3,
	wins: 0,
	loses: 0,
	ties: 0,
};
var plyRef = 'player';

var config = {
	apiKey: 'AIzaSyCP_BeXBOanflUEwdoFCObZRXSNG1FD3Pc',
	authDomain: 'rpsmultiplayer-34cc5.firebaseapp.com',
	databaseURL: 'https://rpsmultiplayer-34cc5.firebaseio.com',
	projectId: 'rpsmultiplayer-34cc5',
	storageBucket: '',
	messagingSenderId: '126843285379',
};
firebase.initializeApp(config);

var dbPlayers = firebase.database().ref('players');
var dbChat = firebase.database().ref('chat');
var hasPlyPicked = false;
var oppPicked = false;
var ply = 0;
var gameResult = '';
var oppName = '';

$('.alert').hide();

$(document).ready(function (event) {
	$('body').on('click', '#btn-name', function (event) {
		player.name = $('#name').val().trim();
		event.preventDefault();

		//hide enter name area
		$('.form-inline').hide();

		dbPlayers.once('value', function (snap) {
			if (snap.hasChild('player1') && snap.hasChild('player2')) {
				alert('There are players playing. Try again later');
				return;
			} else if (!snap.hasChild('player1')) {
				ply = 1;
			} else if (!snap.hasChild('player2')) {
				ply = 2;
			}

			plyRef += ply;

			listenForNodeChanges();
			//turn on chat
			chatListner();

			dbPlayers.child(plyRef).set({
				name: player.name,
				pick: player.pick,
				wins: player.wins,
				loses: player.loses,
				ties: player.ties,
			});

			//show play area
			$('.container').attr('style', 'dispaly:block');
			//insert name in ply div
			$(`#ply${ply}Name`).html(player.name);
			//add class for pulse animation
			$(`.ply${ply}`).addClass('pulse');

			//fade opp player's images/area
			ply === 1 ? $('.ply2').fadeTo(500, 0.5) : $('.ply1').fadeTo(500, 0.5);
			//on player's pick/click
			$(`.image${ply}`).on('click', function (r) {
				console.log('clicked');
				if (!hasPlyPicked) {
					hasPlyPicked = true;

					//clone clicked img to play area
					$(`#ply${ply}pick`).append(`Player ${ply}`, $(r.target).clone());
					//remove pulsating animation
					$(`.ply${ply}`).removeClass('pulse');

					//add pulsating animation to opp side
					$(`.ply${3 - ply}`).addClass('pulse');
					//fade player's area
					$(`.ply${ply}`).fadeTo(1000, 0.3);

					//update remote Node
					player.pick = $(r.target).attr('value');
					var updatePick = {
						pick: player.pick
					};
					dbPlayers.child(plyRef).update(updatePick);

					if (oppPicked) {
						dbPlayers.child(`player${3 - ply}/pick`).once('value', function (snap) {
							console.log('line 114 ' + snap.val());
							if (snap.val() != 3) {
								console.log('checking winner from line 116');
								dbPlayers.child(plyRef).update(checkWinner(snap.val()));
							}

						});
					}
				}
			});

		});
	});

	//on submit chat
	$('body').on('click', '#btn-chat', function (e) {
		// e.preventDefault();
		var message = $('#btn-input').val()

		console.log(message);

		dbChat.child(plyRef).set({
			msg: message
		})
		insertChat(player.name, message, 'text-primary');

		$('#btn-input').val('');


	});

});

function insertChat(name, msg, textColor) {
	var chatDiv = $('<li>').addClass('p-0 m-0');
	var chatMsg = $(`<p>`).addClass(`${textColor} p-0 m-0`).html(`<b>${name}: </b>${msg}`);
	chatDiv.append(chatMsg);
	$(`ul`).append(chatDiv);
	$('.chatdisplay').scrollTop($('.chatdisplay').prop('scrollHeight'));
}

function chatListner() {
	dbChat.child(`player${3 - ply}`).on('value', snap => {
		try {
			console.log(snap.val().msg);
			insertChat(oppName, snap.val().msg, 'text-danger');
		} catch (error) {
			//console.error(error);
		}

	}, function (errObj) {
		console.log(errObj.code);
	})
}


function updateStats() {
	$('#wins').html(player.wins);
	$('#ties').html(player.ties);
	$('#loses').html(player.loses);
}

function listenForNodeChanges() {
	//on other player's name change,get name to display
	dbPlayers.child(`player${3 - ply}/name`).on('value', function (snap) {
			// console.log(snap.val());
			oppName = snap.val();
			$(`#ply${3 - ply}Name`).html(oppName);

			//on opp ply change, reset stats
			player.wins = 0;
			player.loses = 0;
			player.ties = 0;
			updateStats();
		},
		function (errorObject) {
			console.log('Errors handled: ' + errorObject.code);
		}
	);
	//listen on opp player's pick
	dbPlayers.child(`player${3 - ply}/pick`).on('value', function (snap) {
			console.log('line 59 ' + snap.val());
			if (snap.val() < 3 && snap.val() >= 0 && snap.val() != null) {
				console.log('line 61 ' + snap.val());
				oppPicked = true;
				if (hasPlyPicked) {
					console.log('hasPicked');
					console.log('checking winner from line 64');
					dbPlayers.child(plyRef).update(checkWinner(snap.val()));
				}
			}
		},
		function (errorObject) {
			console.log('Errors handled: ' + errorObject.code);
		}
	);
}


function displayOppPick() {
	if (hasPlyPicked && oppPicked) {

		dbPlayers.child(`player${3 - ply}/pick`).once('value', function (snap) {

			$(`#ply${3-ply}pick`).append(`Player${3-ply}`, $(`#${snap.val()}`).clone());

			$('#alertmsg').html(gameResult);

			setTimeout(e => {
				$('.alert').show();
			}, 250)
			setTimeout(e => {
				resetGame();
			}, 3000)
		}, function (errObj) {
			console.log(errObj.code);
		});
	}
}

function resetGame() {
	hasPlyPicked = false;
	oppPicked = false;
	$('#ply1pick').empty();
	$('#ply2pick').empty();
	$(`#ply${ply}Name`).html(player.name);
	$(`.ply${ply}`).addClass('pulse');
	$(`.ply${ply}`).fadeTo(500, 1.0);
	$(`.ply${3 - ply}`).removeClass('pulse');
	$('.alert').hide();

	var updatePick = {
		pick: 3
	};

	dbPlayers.child(plyRef).update(updatePick);


	ply === 1 ? $('.ply2').fadeTo(500, 0.5) : $('.ply1').fadeTo(500, 0.5);

}

function checkWinner(oppPick) {
	var obj = {};
	console.log(`Player: ${player.pick} - Opp: ${oppPick}`);
	oppPick = parseInt(oppPick);
	plyPick = parseInt(player.pick);

	if (plyPick === oppPick + 2) {
		obj = {
			loses: ++player.loses
		};
		gameResult = 'You Lose';
		console.log('from: OR - PS');
	} else if (plyPick + 2 === oppPick) {
		obj = {
			wins: ++player.wins
		};
		console.log('from: OS - PR');
		gameResult = 'You Win';
	} else if (plyPick === oppPick) {
		obj = {
			ties: ++player.ties
		};
		console.log('from: tie');
		gameResult = 'Game Tied';
	} else if (plyPick < oppPick) {
		obj = {
			loses: ++player.loses
		}
		console.log('from: O');
		gameResult = 'You Lose';
	} else if (plyPick > oppPick) {
		obj = {
			wins: ++player.wins
		};
		gameResult = 'You Win';
		console.log('from: P');
	}
	displayOppPick();
	updateStats();
	return obj;
}

window.onbeforeunload = function () {
	dbPlayers.child(plyRef).remove();
	dbChat.child(plyRef).remove();

};