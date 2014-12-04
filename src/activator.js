var Starter = require('./Starter.js');

var mongod;
module.exports = {
	start: function(ctx) {
		var options = ctx.preference;
		
		mongod = Starter.create('default', options).start(console);
		
		console.log('* mongodb started', options);
	},
	stop: function(ctx) {
		mongod.stop();
	}
};