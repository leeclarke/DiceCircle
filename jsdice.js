/**
 *  JSDice is an open source web application where this code was taken. 
 *  To check out the original please link here: http://www.jsdice.com/roller/
 *  THANKS JSDice for the great open source code!!
 * 
 * 
 * Copyright 2009 jsdice.com. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.    
 */
function roll(dice)
{
	var dice = dice.replace(/- */,'+ -');
	var dice = dice.replace(/D/,'d');
	var re = / *\+ */;
	var items = dice.split(re);
	var res = new Array();
	var type = new Array();
	for ( var i=0; i<items.length; i++) {
		var match = items[i].match(/^[ \t]*(-)?(\d+)?(?:(d)(\d+))?[ \t]*$/);
		if (match) {
			var sign = match[1]?-1:1;
			var num = parseInt(match[2] || "1");
			var max = parseInt(match[4] || "0");
			if (match[3]) {
				for ( j=1; j<=num; j++) {
					res[res.length] = sign * Math.ceil(max*Math.random());
					type[type.length] = max;
				}
			}
			else {
				res[res.length] = sign * num;
				type[type.length] = 0;
			}
		} 
		else return null;
	}
	if (res.length == 0) return null;
	return {"res":res, "type":type};
}

function resultStr(data)
{
	var total = 0;
	var str = "";
	for (var i=0; i<data.res.length; i++) {
		total = total + data.res[i];
		if (data.res.length>1) {
			if (i) str = str + ((data.res[i])>=0?"+":"-");
			str = str + Math.abs(data.res[i]);
			if (data.type[i]) str = str + "<sub>[d"+data.type[i]+"]</sub>";
		}
	}
	str = "<strong>" + total + "</strong>" + (str?"&nbsp;=&nbsp;" + str:'');
	return str;
}

function rollDice(dice)
{
	if (!dice) return;

	var el = document.getElementById("results");
	var data = roll(dice);

	if (data) {
		var str = resultStr(data);
		el.innerHTML += '<div class="roll_source"><small><strong>Roll:</strong></small> <a href="javascript:doRoll(\''+dice+'\');"><code>'+dice+'</code></a></div>';
		el.innerHTML += '<div class="roll_result">' + str + '</div>';
	}
	else {
		el.innerHTML += '<div class="roll_source"><small><strong>Roll:</strong></small> <code>'+dice+'</code> <small>[<strong><em>Error in the roll formula</em></strong>]</small></div>';
	}
}

function go()
{
	var el = document.getElementById("inp_text");
	rollDice(el.value);
	el.focus();
	var el = document.getElementById("results");
	el.scrollTop = el.scrollHeight;
}

function doRoll(dice)
{
	var el = document.getElementById("inp_text");
	el.value = dice;
	rollDice(el.value);
	el.focus();
	var el = document.getElementById("results");
	el.scrollTop = el.scrollHeight;
}

function doClear()
{
	var el = document.getElementById("results");
	el.innerHTML = '';
	el.scrollTop = el.scrollHeight;
	var el = document.getElementById("inp_text");
	el.focus();
}

function doHelp()
{
	var el = document.getElementById("results");
	el.innerHTML += '<div class="roll_source"><small><strong>Help:</strong></small></div>';
	el.innerHTML += '<div class="roll_help">' +
		'<strong>Usage</strong>: <em>js</em>Dice is a simple yet flexible dice roller for roleplaying games. To use it just type the number and kind of dice to roll and hit the "Go!" button or the return key. The dice are given in the format used by the d20 system. For example, to roll a d20 (20-sided dice) type <code><a href="javascript:doRoll(\'d20\')">d20</a></code>. Different kinds of dice can be used in the same roll and modifiers can be added or subtracted. Non-standard dice are fully supported. Here are more examples: <br />' +
		'<ul>' +
		'<li><code><a href="javascript:doRoll(\'10d6\')">10d6</a></code></li> ' +
		'<li><code><a href="javascript:doRoll(\'5d8+10\')">5d8+10</a></code></li> ' +
		'<li><code><a href="javascript:doRoll(\'d20+7\')">d20+7</a></code></li> ' +
		'<li><code><a href="javascript:doRoll(\'d20-5\')">d20-5</a></code></li> ' +
		'<li><code><a href="javascript:doRoll(\'8+5d8+4d12+48\')">8+5d8+4d12+48</a></code></li> ' +
		'<li><code><a href="javascript:doRoll(\'2d20-d4\')">2d20-d4</a></code></li> ' +
		'<li><code><a href="javascript:doRoll(\'d2+d3\')">d2+d3</a></code></li> ' +
		'</ul>' +
		'<hr />' +
		'<strong>Presets</strong>: The buttons below the text input can be used to quickly roll a single die. Press the clear button to clear the results area. When making a roll, the input appears as a text link. By clicking on the link the roll is made again. You can save a previous roll by bookmarking the link. The easiest way to do this is to drag the link to the bookmark sidebar or the toolbar, if your browser supports this. Just click on the bookmark with this page loaded to make the roll. ' +
		'<hr />' +
		'<strong>Offline use</strong>: <em>js</em>Dice is fully written in client-side javascript. This means that you can use it offline. You just need to <a href="http://www.jsdice.com/roller/jsdice.html" rel="nofollow">download jsdice.html</a> on your desktop and load it in your favorite browser to use it. Alternatively, you can download <a href="http://www.jsdice.com/roller/jsdice.zip">jsdice.zip</a> which is a compressed version of this file. ' +
		'<hr />' +
		'<strong>License</strong>: <em>js</em>Dice is open source, distributed under the FreeBSD license, included in the beginning of this file (view source to see it). If you wish to redistribute it you may use the <a href="http://www.jsdice.com/roller/jsdice.zip">jsdice.zip</a> archive, link directly to it or even link to this page. ' +
		'</div>';
	el.scrollTop = el.scrollHeight;
	var el = document.getElementById("inp_text");
	el.focus();
}

function inp_keydown(ev)
{
	if (window.event && window.event.key) var key = window.event.key;
	if (window.event && window.event.keyCode) var key = window.event.keyCode;
	else if (ev && ev.keyCode) var key = ev.keyCode;
	else if (ev && ev.which) var key = ev.which;
	else return true;

	if (key==13) {
		go();
		var el = document.getElementById("inp_text");
		el.select();
		return false;
	}
	else {
		return true;
	}
}

function jokerizer()
{
	var el = document.getElementById('contact');
	var a = String.fromCharCode(64);
	var mt = 'mai';
	mt += 'l';
	mt += 'to'+':';
	el.innerHTML = el.innerHTML.replace(/(\w+) (\w+) (com)./,'<a href="'+mt+'$1'+a+'$2.$3">$1'+a+'$2.$3</a>.');
}
